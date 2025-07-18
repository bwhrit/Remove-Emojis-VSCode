import * as assert from 'assert';
import { EmojiDetector } from '../emojiDetector';

suite('EmojiDetector Test Suite', () => {
    
    test('Should detect common emojis', () => {
        const testCases = [
            { text: 'Hello 😀 World', hasEmoji: true },
            { text: 'Test 🎨 string', hasEmoji: true },
            { text: 'Multiple 😀🎨🚀 emojis', hasEmoji: true },
            { text: 'Heart ❤️ emoji', hasEmoji: true },
            { text: 'Flag 🇺🇸 emoji', hasEmoji: true },
            { text: 'No emoji here', hasEmoji: false },
            { text: 'Plain text only', hasEmoji: false }
        ];

        testCases.forEach(({ text, hasEmoji }) => {
            assert.strictEqual(
                EmojiDetector.containsEmoji(text),
                hasEmoji,
                `Failed for: "${text}"`
            );
        });
    });

    test('Should count emojis correctly', () => {
        const testCases = [
            { text: 'Hello 😀 World', count: 1 },
            { text: 'Multiple 😀🎨🚀 emojis', count: 3 },
            { text: 'No emoji here', count: 0 },
            { text: '😀😀😀', count: 3 },
            { text: 'Start 🎨 middle 🚀 end 😀', count: 3 }
        ];

        testCases.forEach(({ text, count }) => {
            assert.strictEqual(
                EmojiDetector.countEmojis(text),
                count,
                `Failed counting for: "${text}"`
            );
        });
    });

    test('Should find emoji positions correctly', () => {
        const text = 'Hello 😀 World 🎨 Test';
        const emojis = EmojiDetector.findEmojis(text);
        
        assert.strictEqual(emojis.length, 2);
        assert.strictEqual(emojis[0].emoji, '😀');
        assert.strictEqual(emojis[0].index, 6);
        assert.strictEqual(emojis[1].emoji, '🎨');
        assert.strictEqual(emojis[1].index, 14);
    });

    test('Should remove emojis and preserve formatting', () => {
        const testCases = [
            {
                input: 'Hello 😀 World',
                expected: 'Hello World'
            },
            {
                input: '😀 Start with emoji',
                expected: 'Start with emoji'
            },
            {
                input: 'End with emoji 😀',
                expected: 'End with emoji'
            },
            {
                input: 'Multiple  😀  spaces',
                expected: 'Multiple  spaces'
            },
            {
                input: '😀😀😀 Multiple emojis',
                expected: 'Multiple emojis'
            },
            {
                input: 'Line1\n😀 Line2',
                expected: 'Line1\nLine2'
            },
            {
                input: 'No emoji here',
                expected: 'No emoji here'
            },
            {
                input: '🎨 Generating PNG assets...',
                expected: 'Generating PNG assets...'
            }
        ];

        testCases.forEach(({ input, expected }) => {
            const result = EmojiDetector.removeEmojis(input);
            assert.strictEqual(
                result,
                expected,
                `Failed for: "${input}" -> Expected: "${expected}", Got: "${result}"`
            );
        });
    });

    test('Should handle complex emoji sequences', () => {
        const testCases = [
            {
                input: 'Family: 👨‍👩‍👧‍👦',
                expected: 'Family:',
                description: 'ZWJ sequence'
            },
            {
                input: 'Skin tone: 👋🏽',
                expected: 'Skin tone:',
                description: 'Fitzpatrick modifier'
            },
            {
                input: 'Heart: ❤️ (with variation selector)',
                expected: 'Heart: (with variation selector)',
                description: 'Variation selector'
            },
            {
                input: 'Copyright © and ® symbols',
                expected: 'Copyright and symbols',
                description: 'Basic Latin symbols used as emoji'
            }
        ];

        testCases.forEach(({ input, expected, description }) => {
            const result = EmojiDetector.removeEmojis(input);
            assert.strictEqual(
                result,
                expected,
                `Failed for ${description}: "${input}"`
            );
        });
    });

    test('Should handle edge cases', () => {
        assert.strictEqual(EmojiDetector.removeEmojis(''), '');
        assert.strictEqual(EmojiDetector.removeEmojis('   '), '   ');
        assert.strictEqual(EmojiDetector.removeEmojis('\n\n'), '\n\n');
        assert.strictEqual(EmojiDetector.removeEmojis('😀'), '');
    });
});