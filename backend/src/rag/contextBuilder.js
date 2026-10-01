export const buildContext = (results) => {
    return results
        .map((result, index) => {
            return `
Source ${index + 1}
Page: ${result.page}

${result.text}
`;
        })
        .join("\n");
};
