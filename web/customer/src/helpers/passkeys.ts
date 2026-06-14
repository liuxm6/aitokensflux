import type { NodeBufferCtor } from "../types";

function base64UrlToArrayBuffer(value?: string | null): ArrayBuffer {
  if (!value) return new ArrayBuffer(0);
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const globalRef = globalThis as typeof globalThis & {
    Buffer?: NodeBufferCtor;
  };
  const decode =
    typeof globalRef.atob === "function"
      ? globalRef.atob.bind(globalRef)
      : (input: string) => {
          if (typeof globalRef.Buffer !== "undefined") {
            return globalRef.Buffer.from(input, "base64").toString("binary");
          }
          throw new Error("Base64 decoding is not supported");
        };
  const binary = decode(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return buffer;
}

function arrayBufferToBase64Url(buffer?: ArrayBuffer | ArrayBufferLike | null) {
  if (!buffer) return "";
  const globalRef = globalThis as typeof globalThis & {
    Buffer?: NodeBufferCtor;
  };
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  const encode =
    typeof globalRef.btoa === "function"
      ? globalRef.btoa.bind(globalRef)
      : (input: string) => {
          if (typeof globalRef.Buffer !== "undefined") {
            return globalRef.Buffer.from(input, "binary").toString("base64");
          }
          throw new Error("Base64 encoding is not supported");
        };
  return encode(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function prepareCredentialRequestOptions(
  payload: unknown,
): PublicKeyCredentialRequestOptions {
  const source = payload as Record<string, any>;
  const options =
    source?.publicKey ??
    source?.PublicKey ??
    source?.response ??
    source?.Response;
  if (!options) throw new Error("Unable to parse Passkey login options");
  const publicKey: PublicKeyCredentialRequestOptions & Record<string, any> = {
    ...options,
    challenge: base64UrlToArrayBuffer(options.challenge),
  };
  if (Array.isArray(options.allowCredentials)) {
    publicKey.allowCredentials = options.allowCredentials.map((item: any) => ({
      ...item,
      id: base64UrlToArrayBuffer(item.id),
    }));
  }
  return publicKey;
}

export function buildAssertionResult(credential: PublicKeyCredential | null) {
  if (!credential) return null;
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: arrayBufferToBase64Url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment,
    response: {
      authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
      clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
      signature: arrayBufferToBase64Url(response.signature),
      userHandle: response.userHandle
        ? arrayBufferToBase64Url(response.userHandle)
        : null,
    },
    clientExtensionResults: credential.getClientExtensionResults?.() ?? {},
  };
}

export async function isPasskeySupported() {
  if (!window.PublicKeyCredential) return false;
  if (
    typeof PublicKeyCredential.isConditionalMediationAvailable === "function"
  ) {
    try {
      if (await PublicKeyCredential.isConditionalMediationAvailable()) {
        return true;
      }
    } catch {
      // Ignore and try platform authenticator detection.
    }
  }
  if (
    typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ===
    "function"
  ) {
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }
  return true;
}
