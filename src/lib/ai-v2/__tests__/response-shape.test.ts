// Tests for response shape validation

import { describe, it, expect } from 'vitest';
import type { AgentSDKResponse } from '../../../lib/agent-sdk';

describe('Response Shape Validation', () => {
  it('should have all required fields', () => {
    const response: AgentSDKResponse = {
      text: 'Test response',
      mode: 'chat',
      lang: 'en',
      sources: [],
      validatedVerses: [],
      followUpQuestions: [],
      validationStatus: 'verified'
    };

    expect(response.text).toBeDefined();
    expect(response.mode).toBeDefined();
    expect(response.lang).toBeDefined();
  });

  it('should handle optional thinking field', () => {
    const response: AgentSDKResponse = {
      text: 'Test response',
      mode: 'chat',
      lang: 'en',
      thinking: {
        reasoningSummary: ['Reason 1', 'Reason 2'],
        selectedSources: [
          {
            filename: 'John 3:16',
            score: 0.95
          }
        ],
        confidence: 'high'
      }
    };

    expect(response.thinking).toBeDefined();
    expect(response.thinking?.reasoningSummary).toHaveLength(2);
    expect(response.thinking?.confidence).toBe('high');
  });

  it('should validate mode enum', () => {
    const validModes: AgentSDKResponse['mode'][] = ['chat', 'verse', 'parable', 'character', 'topical', 'qa'];
    
    validModes.forEach(mode => {
      const response: AgentSDKResponse = {
        text: 'Test',
        mode,
        lang: 'en'
      };
      expect(response.mode).toBe(mode);
    });
  });

  it('should validate language enum', () => {
    const validLangs: AgentSDKResponse['lang'][] = ['en', 'ta'];
    
    validLangs.forEach(lang => {
      const response: AgentSDKResponse = {
        text: 'Test',
        mode: 'chat',
        lang
      };
      expect(response.lang).toBe(lang);
    });
  });

  it('should validate validationStatus enum', () => {
    const validStatuses: AgentSDKResponse['validationStatus'][] = ['verified', 'partial', 'failed'];
    
    validStatuses.forEach(status => {
      const response: AgentSDKResponse = {
        text: 'Test',
        mode: 'chat',
        lang: 'en',
        validationStatus: status
      };
      expect(response.validationStatus).toBe(status);
    });
  });

  it('should handle sources array structure', () => {
    const response: AgentSDKResponse = {
      text: 'Test',
      mode: 'chat',
      lang: 'en',
      sources: [
        {
          id: 'source-1',
          filename: 'John 3:16',
          score: 0.95,
          reference: 'John 3:16',
          snippet: 'For God so loved...',
          verseText: 'For God so loved the world...'
        }
      ]
    };

    expect(response.sources).toHaveLength(1);
    expect(response.sources?.[0].id).toBe('source-1');
    expect(response.sources?.[0].score).toBeGreaterThanOrEqual(0);
    expect(response.sources?.[0].score).toBeLessThanOrEqual(1);
  });

  it('should handle validatedVerses array structure', () => {
    const response: AgentSDKResponse = {
      text: 'Test',
      mode: 'chat',
      lang: 'en',
      validatedVerses: [
        {
          reference: 'John 3:16',
          verseText: 'For God so loved the world...',
          book: 'John',
          chapter: 3,
          verse: 16
        }
      ]
    };

    expect(response.validatedVerses).toHaveLength(1);
    expect(response.validatedVerses?.[0].book).toBe('John');
    expect(response.validatedVerses?.[0].chapter).toBe(3);
    expect(response.validatedVerses?.[0].verse).toBe(16);
  });

  it('should handle followUpQuestions array structure', () => {
    const response: AgentSDKResponse = {
      text: 'Test',
      mode: 'chat',
      lang: 'en',
      followUpQuestions: [
        {
          question: 'What does this mean?',
          relevance: 0.9
        }
      ]
    };

    expect(response.followUpQuestions).toHaveLength(1);
    expect(response.followUpQuestions?.[0].relevance).toBeGreaterThanOrEqual(0);
    expect(response.followUpQuestions?.[0].relevance).toBeLessThanOrEqual(1);
  });
});

