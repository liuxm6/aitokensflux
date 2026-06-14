/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

export function getAdminBasePath() {
  const raw = import.meta.env.VITE_ADMIN_BASE_PATH || '/admin';
  const normalized = raw.trim().replace(/\/+$/, '');
  return normalized === '' || normalized === '/' ? '' : normalized;
}

export function withAdminBasePath(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const basePath = getAdminBasePath();
  if (normalizedPath === '/') {
    return basePath || '/';
  }
  return `${basePath}${normalizedPath}`;
}
