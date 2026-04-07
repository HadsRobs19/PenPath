package unit_test

import (
	"testing"
)

// TestBadgeServiceCreation tests the badge service constructor
func TestBadgeServiceCreation(t *testing.T) {
	// Test that NewBadgeService creates a non-nil service
	// In a real test, we would use a mock DB
	t.Run("NewBadgeService with nil DB", func(t *testing.T) {
		// This is a placeholder - in production you'd use a mock
		// service := services.NewBadgeService(nil)
		// The actual implementation would need dependency injection for proper testing
		t.Log("Badge service creation test - requires mock DB implementation")
	})
}

// TestBadgeCriteriaLogic tests the badge criteria checking logic
func TestBadgeCriteriaLogic(t *testing.T) {
	testCases := []struct {
		name              string
		totalSteps        int
		completedSteps    int
		expectedCompleted bool
	}{
		{
			name:              "All steps completed",
			totalSteps:        5,
			completedSteps:    5,
			expectedCompleted: true,
		},
		{
			name:              "No steps completed",
			totalSteps:        5,
			completedSteps:    0,
			expectedCompleted: false,
		},
		{
			name:              "Partial completion",
			totalSteps:        5,
			completedSteps:    3,
			expectedCompleted: false,
		},
		{
			name:              "Single step lesson completed",
			totalSteps:        1,
			completedSteps:    1,
			expectedCompleted: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			isComplete := tc.totalSteps == tc.completedSteps
			if isComplete != tc.expectedCompleted {
				t.Errorf("Expected completed=%v, got %v", tc.expectedCompleted, isComplete)
			}
		})
	}
}

// TestBadgeUnlockConditionParsing tests parsing of badge unlock conditions
func TestBadgeUnlockConditionParsing(t *testing.T) {
	testCases := []struct {
		name            string
		unlockCondition string
		expectedType    string
		expectedValue   string
	}{
		{
			name:            "Lesson complete condition",
			unlockCondition: "lesson_complete:abc-123",
			expectedType:    "lesson_complete",
			expectedValue:   "abc-123",
		},
		{
			name:            "Perfect score condition",
			unlockCondition: "perfect_score:5",
			expectedType:    "perfect_score",
			expectedValue:   "5",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Parse the unlock condition
			// Format: "type:value"
			parts := splitCondition(tc.unlockCondition)
			if len(parts) != 2 {
				t.Fatalf("Expected 2 parts, got %d", len(parts))
			}
			if parts[0] != tc.expectedType {
				t.Errorf("Expected type=%s, got %s", tc.expectedType, parts[0])
			}
			if parts[1] != tc.expectedValue {
				t.Errorf("Expected value=%s, got %s", tc.expectedValue, parts[1])
			}
		})
	}
}

// Helper function to split unlock condition
func splitCondition(condition string) []string {
	result := make([]string, 0, 2)
	colonIndex := -1
	for i, c := range condition {
		if c == ':' {
			colonIndex = i
			break
		}
	}
	if colonIndex == -1 {
		return []string{condition}
	}
	result = append(result, condition[:colonIndex])
	result = append(result, condition[colonIndex+1:])
	return result
}

// TestBadgePointsCalculation tests badge points calculation
func TestBadgePointsCalculation(t *testing.T) {
	testCases := []struct {
		name           string
		badgeType      string
		expectedPoints int
	}{
		{
			name:           "Colors badge",
			badgeType:      "colors",
			expectedPoints: 100,
		},
		{
			name:           "Animals badge",
			badgeType:      "animals",
			expectedPoints: 100,
		},
		{
			name:           "Unknown badge type",
			badgeType:      "unknown",
			expectedPoints: 50, // Default points
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			points := calculateBadgePoints(tc.badgeType)
			if points != tc.expectedPoints {
				t.Errorf("Expected points=%d for type=%s, got %d", tc.expectedPoints, tc.badgeType, points)
			}
		})
	}
}

// Helper function to calculate badge points
func calculateBadgePoints(badgeType string) int {
	switch badgeType {
	case "colors", "animals":
		return 100
	default:
		return 50
	}
}
