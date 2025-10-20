# EduGame Creator Settings Feature Design

## Overview
This document outlines the design for implementing a settings feature that allows users to customize the AI prompts used for game generation in the EduGame Creator application.

## Architecture

### 1. Data Structure
```typescript
interface Settings {
  mainPrompt: string;
  refinementPrompt: string;
  useCustomPrompts: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetToDefaults: () => void;
  isLoading: boolean;
}
```

### 2. Component Structure
```
App.tsx
├── Header.tsx (with settings button)
├── SettingsPanel.tsx (slide-in from left)
│   ├── PromptEditor.tsx (for main prompt)
│   └── PromptEditor.tsx (for refinement prompt)
├── SettingsContext.tsx
└── SettingsService.ts
```

### 3. Storage Strategy
- Use localStorage with key 'edugame-settings'
- Default prompts stored as constants in SettingsService
- Automatic loading on app initialization
- Immediate saving on settings changes

## UI/UX Design

### 1. Settings Access
- Settings icon (cog/gear) in Header component next to "EduGame Creator" title
- Icon matches existing design language (similar to CloseIcon in GameViewer)
- Hover state with subtle animation

### 2. Settings Panel
- Slide-in animation from left, replacing the sidebar content
- Full height of sidebar area
- Smooth transition with backdrop overlay
- Close button in top-right corner
- Backdrop click to close

### 3. Prompt Editor Interface
- Two sections: "Main System Prompt" and "Refinement Prompt"
- Large textarea for each prompt with monospace font
- Character count display
- Validation feedback (required elements check)
- "Reset to Default" button for each section
- "Save Changes" button at bottom
- "Cancel" button to discard changes

### 4. Visual Design
- Consistent with existing app styling
- Same card style as other components (white background, rounded corners, shadow)
- Dark mode support
- Responsive design
- Clear visual hierarchy

## Implementation Details

### 1. Settings Service
```typescript
class SettingsService {
  private static readonly STORAGE_KEY = 'edugame-settings';
  
  static getSettings(): Settings
  static saveSettings(settings: Settings): void
  static getDefaultSettings(): Settings
  static validatePrompt(prompt: string): { isValid: boolean; errors: string[] }
}
```

### 2. Context Provider
- Wrap App component with SettingsProvider
- Provide settings state and update functions
- Handle loading state from localStorage
- Persist changes automatically

### 3. Gemini Service Integration
- Modify generateMinigameCode to use custom main prompt
- Modify refineMinigameCode to use custom refinement prompt
- Fallback to default prompts if custom ones are invalid
- Add error handling for prompt validation

### 4. Validation Rules
- Minimum character count (e.g., 50 characters)
- Required keywords (e.g., "HTML", "game", "children")
- No malicious content patterns
- Proper structure for AI instructions

## User Flow

1. User clicks settings icon in header
2. Settings panel slides in from left
3. User can view current prompts
4. User edits prompts in textareas
5. Real-time validation feedback
6. User clicks "Save Changes" or "Cancel"
7. If saved, settings persist to localStorage
8. Panel slides out, returning to main view
9. Next game generation uses custom prompts

## Technical Considerations

### 1. Performance
- Debounce save operations to avoid excessive localStorage writes
- Lazy load settings only when needed
- Efficient state updates with React context

### 2. Error Handling
- Graceful fallback to default prompts
- Clear error messages for validation failures
- Recovery from corrupted localStorage data

### 3. Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management in settings panel

### 4. Security
- Sanitize prompts before storage
- Prevent XSS in prompt display
- Validate prompt content before use

## Future Enhancements

1. **Prompt Templates**: Pre-defined templates for different educational focuses
2. **Import/Export**: Allow users to share prompt configurations
3. **Version History**: Track and revert to previous prompt versions
4. **A/B Testing**: Compare effectiveness of different prompts
5. **Advanced Settings**: Additional AI parameters (temperature, max tokens, etc.)

## Testing Strategy

1. Unit tests for SettingsService methods
2. Component testing for SettingsPanel and PromptEditor
3. Integration tests for context provider
4. E2E tests for complete settings workflow
5. Validation testing for various prompt inputs
6. localStorage behavior testing