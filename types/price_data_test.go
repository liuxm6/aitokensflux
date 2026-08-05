package types

import (
	"math"
	"testing"

	"github.com/shopspring/decimal"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// isValidOtherRatio is the guard that protects every downstream quota
// multiplication from being poisoned by a non-positive, NaN, or +Inf ratio.
func TestIsValidOtherRatio(t *testing.T) {
	cases := []struct {
		name  string
		ratio float64
		valid bool
	}{
		{"positive", 2.5, true},
		{"one", 1.0, true},
		{"small positive", 0.0001, true},
		{"zero rejected", 0, false},
		{"negative rejected", -1, false},
		{"nan rejected", math.NaN(), false},
		{"positive inf rejected", math.Inf(1), false},
		// -Inf is < 0 so it is rejected by the ratio > 0 check.
		{"negative inf rejected", math.Inf(-1), false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			assert.Equal(t, tc.valid, isValidOtherRatio(tc.ratio))
		})
	}
}

// AddOtherRatio must silently drop invalid ratios so they never reach quota math.
func TestPriceDataAddOtherRatio(t *testing.T) {
	p := &PriceData{}

	p.AddOtherRatio("valid", 2.0)
	p.AddOtherRatio("zero", 0)
	p.AddOtherRatio("negative", -3.0)
	p.AddOtherRatio("nan", math.NaN())
	p.AddOtherRatio("inf", math.Inf(1))

	ratios := p.OtherRatios()
	require.Len(t, ratios, 1)
	assert.Equal(t, 2.0, ratios["valid"])

	assert.True(t, p.HasOtherRatio("valid"))
	assert.False(t, p.HasOtherRatio("zero"))
	assert.False(t, p.HasOtherRatio("missing"))
}

// OtherRatios returns nil (not an empty map) when nothing valid is stored, and
// returns a defensive copy that cannot mutate the internal state.
func TestPriceDataOtherRatiosCopy(t *testing.T) {
	p := &PriceData{}
	assert.Nil(t, p.OtherRatios())

	p.AddOtherRatio("a", 3.0)
	ratios := p.OtherRatios()
	ratios["a"] = 999.0
	ratios["b"] = 5.0

	// Mutating the returned map must not change internal state.
	assert.Equal(t, 3.0, p.OtherRatios()["a"])
	assert.False(t, p.HasOtherRatio("b"))
}

func TestPriceDataReplaceOtherRatios(t *testing.T) {
	p := &PriceData{}
	p.AddOtherRatio("old", 4.0)

	ok := p.ReplaceOtherRatios(map[string]float64{"x": 2.0, "bad": -1.0, "y": 3.0})
	assert.True(t, ok)
	// Old ratios are cleared, only new valid ones remain.
	assert.False(t, p.HasOtherRatio("old"))
	assert.Equal(t, map[string]float64{"x": 2.0, "y": 3.0}, p.OtherRatios())

	// Replacing with only-invalid ratios yields an empty result.
	ok = p.ReplaceOtherRatios(map[string]float64{"bad": 0})
	assert.False(t, ok)
	assert.Nil(t, p.OtherRatios())
}

// OtherRatioMultiplier multiplies every valid, non-1.0 ratio. Ratio 1.0 is a
// no-op and invalid ratios are ignored, so the multiplier can never turn
// negative or NaN.
func TestPriceDataOtherRatioMultiplier(t *testing.T) {
	p := &PriceData{}
	assert.Equal(t, 1.0, p.OtherRatioMultiplier(), "no ratios means identity multiplier")

	p.AddOtherRatio("a", 2.0)
	p.AddOtherRatio("one", 1.0) // ignored (no-op)
	p.AddOtherRatio("b", 3.0)
	assert.Equal(t, 6.0, p.OtherRatioMultiplier())
}

func TestPriceDataApplyAndRemoveOtherRatiosFloat(t *testing.T) {
	p := &PriceData{}
	p.AddOtherRatio("a", 2.0)
	p.AddOtherRatio("b", 5.0)

	applied := p.ApplyOtherRatiosToFloat(10.0)
	assert.Equal(t, 100.0, applied)

	// Removing should invert applying.
	assert.InDelta(t, 10.0, p.RemoveOtherRatiosFromFloat(applied), 1e-9)
}

func TestPriceDataApplyOtherRatiosToDecimal(t *testing.T) {
	p := &PriceData{}
	p.AddOtherRatio("a", 2.0)
	p.AddOtherRatio("b", 1.5)

	result := p.ApplyOtherRatiosToDecimal(decimal.NewFromInt(4))
	assert.True(t, decimal.NewFromInt(12).Equal(result), "expected 12, got %s", result)
}
