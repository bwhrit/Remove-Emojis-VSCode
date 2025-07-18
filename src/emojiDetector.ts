export class EmojiDetector {
    private static emojiRegex: RegExp;

    static {
        const emojiPatterns = [
            // Emoticons (1F600-1F64F)
            '[\u{1F600}-\u{1F64F}]',
            // Miscellaneous Symbols and Pictographs (1F300-1F5FF)
            '[\u{1F300}-\u{1F5FF}]',
            // Transport and Map Symbols (1F680-1F6FF)
            '[\u{1F680}-\u{1F6FF}]',
            // Miscellaneous Symbols (2600-26FF)
            '[\u{2600}-\u{26FF}]',
            // Dingbats (2700-27BF)
            '[\u{2700}-\u{27BF}]',
            // Supplemental Symbols and Pictographs (1F900-1F9FF)
            '[\u{1F900}-\u{1F9FF}]',
            // Symbols and Pictographs Extended-A (1FA70-1FAFF)
            '[\u{1FA70}-\u{1FAFF}]',
            // CJK Symbols and Punctuation (3000-303F)
            '[\u{3000}-\u{303F}]',
            // Enclosed CJK Letters and Months (3200-32FF)
            '[\u{3200}-\u{32FF}]',
            // Enclosed Alphanumeric Supplement (1F100-1F1FF)
            '[\u{1F100}-\u{1F1FF}]',
            // Additional emoticons
            '[\u{1F000}-\u{1F02F}]',
            '[\u{1F0A0}-\u{1F0FF}]',
            '[\u{1F200}-\u{1F2FF}]',
            // Variation Selectors (FE00-FE0F)
            '[\u{FE00}-\u{FE0F}]',
            // Combining Diacritical Marks for Symbols (20D0-20FF)
            '[\u{20D0}-\u{20FF}]',
            // Zero Width Joiner
            '\u{200D}',
            // Regional Indicator Symbols (1F1E6-1F1FF)
            '[\u{1F1E6}-\u{1F1FF}]',
            // Tags (E0020-E007F)
            '[\u{E0020}-\u{E007F}]',
            // Variation Selectors Supplement (E0100-E01EF)
            '[\u{E0100}-\u{E01EF}]',
            // Fitzpatrick Modifiers (1F3FB-1F3FF)
            '[\u{1F3FB}-\u{1F3FF}]',
            // Additional misc symbols
            '[\u{2194}-\u{2199}]',
            '[\u{21A9}-\u{21AA}]',
            '[\u{231A}-\u{231B}]',
            '[\u{2328}]',
            '[\u{23CF}]',
            '[\u{23E9}-\u{23F3}]',
            '[\u{23F8}-\u{23FA}]',
            '[\u{24C2}]',
            '[\u{25AA}-\u{25AB}]',
            '[\u{25B6}]',
            '[\u{25C0}]',
            '[\u{25FB}-\u{25FE}]',
            '[\u{2B05}-\u{2B07}]',
            '[\u{2B1B}-\u{2B1C}]',
            '[\u{2B50}]',
            '[\u{2B55}]',
            '[\u{3030}]',
            '[\u{303D}]',
            '[\u{3297}]',
            '[\u{3299}]',
            // Basic Latin symbols that are often used as emoji
            '[\u{00A9}]', // ©
            '[\u{00AE}]', // ®
            '[\u{2122}]', // ™
            // Arrows and other symbols
            '[\u{2139}]',
            '[\u{2194}-\u{2199}]',
            '[\u{21A9}-\u{21AA}]',
            '[\u{231A}-\u{231B}]',
            '[\u{2328}]',
            '[\u{23CF}]',
            '[\u{23E9}-\u{23F3}]',
            '[\u{23F8}-\u{23FA}]',
            '[\u{24C2}]',
            '[\u{25AA}-\u{25AB}]',
            '[\u{25B6}]',
            '[\u{25C0}]',
            '[\u{25FB}-\u{25FE}]',
            '[\u{2600}-\u{2604}]',
            '[\u{260E}]',
            '[\u{2611}]',
            '[\u{2614}-\u{2615}]',
            '[\u{2618}]',
            '[\u{261D}]',
            '[\u{2620}]',
            '[\u{2622}-\u{2623}]',
            '[\u{2626}]',
            '[\u{262A}]',
            '[\u{262E}-\u{262F}]',
            '[\u{2638}-\u{263A}]',
            '[\u{2640}]',
            '[\u{2642}]',
            '[\u{2648}-\u{2653}]',
            '[\u{2660}]',
            '[\u{2663}]',
            '[\u{2665}-\u{2666}]',
            '[\u{2668}]',
            '[\u{267B}]',
            '[\u{267F}]',
            '[\u{2692}-\u{2697}]',
            '[\u{2699}]',
            '[\u{269B}-\u{269C}]',
            '[\u{26A0}-\u{26A1}]',
            '[\u{26AA}-\u{26AB}]',
            '[\u{26B0}-\u{26B1}]',
            '[\u{26BD}-\u{26BE}]',
            '[\u{26C4}-\u{26C5}]',
            '[\u{26C8}]',
            '[\u{26CE}-\u{26CF}]',
            '[\u{26D1}]',
            '[\u{26D3}-\u{26D4}]',
            '[\u{26E9}-\u{26EA}]',
            '[\u{26F0}-\u{26F5}]',
            '[\u{26F7}-\u{26FA}]',
            '[\u{26FD}]'
        ];

        // Create a comprehensive regex pattern
        const pattern = emojiPatterns.join('|');
        
        // Add support for emoji sequences (with ZWJ, variation selectors, etc.)
        const sequencePattern = `(?:${pattern})(?:[\u{FE00}-\u{FE0F}\u{1F3FB}-\u{1F3FF}\u{200D}](?:${pattern}))*`;
        
        this.emojiRegex = new RegExp(sequencePattern, 'gu');
    }

    /**
     * Detects if a string contains emojis
     */
    static containsEmoji(text: string): boolean {
        const regex = new RegExp(this.emojiRegex);
        return regex.test(text);
    }

    /**
     * Gets all emoji matches in a string with their positions
     */
    static findEmojis(text: string): Array<{emoji: string, index: number, length: number}> {
        const matches: Array<{emoji: string, index: number, length: number}> = [];
        const regex = new RegExp(this.emojiRegex);
        let match;

        while ((match = regex.exec(text)) !== null) {
            matches.push({
                emoji: match[0],
                index: match.index,
                length: match[0].length
            });
        }

        return matches;
    }

    /**
     * Removes emojis from text while preserving formatting
     */
    static removeEmojis(text: string): string {
        // First, find all emojis
        const emojis = this.findEmojis(text);
        
        if (emojis.length === 0) {
            return text;
        }

        // Process from end to beginning to maintain indices
        let result = text;
        for (let i = emojis.length - 1; i >= 0; i--) {
            const emoji = emojis[i];
            const before = result.slice(0, emoji.index);
            const after = result.slice(emoji.index + emoji.length);
            
            // Check if we need to remove extra spaces
            let trimmedBefore = before;
            let trimmedAfter = after;
            
            // If emoji is at the beginning of a line followed by space, remove the space
            if (before.length === 0 || before.endsWith('\n') || before.endsWith('\r\n')) {
                trimmedAfter = after.replace(/^[ \t]/, '');
            }
            // If emoji is preceded by space and at end of line, remove the space
            else if (after.length === 0 || after.startsWith('\n') || after.startsWith('\r\n')) {
                trimmedBefore = before.replace(/[ \t]$/, '');
            }
            // If emoji is between spaces, handle different cases
            else if (before.match(/ +$/) && after.match(/^ +/)) {
                // Count spaces before and after
                const spacesBefore = before.match(/ +$/)?.[0].length || 0;
                const spacesAfter = after.match(/^ +/)?.[0].length || 0;
                
                // If multiple spaces on both sides, remove the spaces after emoji
                if (spacesBefore >= 2 && spacesAfter >= 2) {
                    trimmedAfter = after.slice(spacesAfter);
                } else if (before.endsWith(' ') && after.startsWith(' ')) {
                    // Single space on each side, remove one
                    trimmedAfter = after.slice(1);
                }
            }
            
            result = trimmedBefore + trimmedAfter;
        }
        
        return result;
    }

    /**
     * Counts the number of emojis in text
     */
    static countEmojis(text: string): number {
        return this.findEmojis(text).length;
    }
}