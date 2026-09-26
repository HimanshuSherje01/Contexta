export const chunkPages = (
    pageTexts,
    chunkSize = 1000,
    overlap = 200
) => {

    const chunks = [];

    for (const page of pageTexts) {

        const text = page.text;

        let start = 0;

        while (start < text.length) {

            let end = Math.min(
                start + chunkSize,
                text.length
            );

            // Try to end at a word boundary
            if (end < text.length) {
                const lastSpace = text.lastIndexOf(" ", end);

                if (lastSpace > start) {
                    end = lastSpace;
                }
            }

            const chunk = text.slice(start, end).trim();

            if (chunk.length > 0) {
                chunks.push({
                    text: chunk,
                    page: page.page
                });
            }

            // If we reached the end of this page, stop.
            if (end >= text.length) {
                break;
            }

            // Move forward while keeping overlap.
            const nextStart = end - overlap;

            // Safety check: NEVER allow start to move backward.
            if (nextStart <= start) {
                start = end;
            } else {
                start = nextStart;
            }
        }
    }

    return chunks;
};