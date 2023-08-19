function compareText() {
    let clientInput = document.getElementById("clientInput").value;
    let compareInput = document.getElementById("compareInput").value;

    let arrayClientInput = clientInput.split(" ");
    let arrayCompareInput = compareInput.split(" ");

    function findCommonElements(array1, array2) {
        let commonElements = [];

        for (let i = 0; i < array1.length; i++) {
            if (array2.includes(array1[i])) {
                commonElements.push(`<span style="color: red">${array1[i]}</span>`);
            } else {
                commonElements.push(array1[i]);
            }
        }

        return commonElements;
    }

    let highlightedText = findCommonElements(arrayClientInput, arrayCompareInput);

    // Join the elements to create a formatted string
    let highlightedTextString = highlightedText.join(' ');

    document.getElementById("output").innerHTML = highlightedTextString;
}