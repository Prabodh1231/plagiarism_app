function compareText() {
    let clientInput = document.getElementById("clientInput").value;
    let compareInput = document.getElementById("compareInput").value;

    let arrayClientInput = clientInput.split(" ");
    let arrayCompareInput = compareInput.split(" ");
    let sizeOfcompairArray = arrayCompareInput.length;
    let sizeOfClientInput = arrayClientInput.length;

    function findCommonElements(array1, array2) {
        let copyClientInput01 = arrayClientInput; // Create a copy
        let copyClientInput02 = arrayClientInput; // Create another copy
        for (let i = 0; i < sizeOfcompairArray; i++) {
            let startOfCompare = i;
            let endOfCompare = i + 13;
            let compareOther = arrayCompareInput.slice(startOfCompare, endOfCompare);
            for (let index = 0; index < sizeOfClientInput; index++) {
                let startOfClient = index;
                let endOfClient = index + 13;
                let compareClient = copyClientInput02.slice(startOfClient, endOfClient);
                console.log(compareOther)
                if (compareClient.every(compare => compareOther.includes(compare))) {
                    let colorCommonElement = compareClient.map((common) => `<span style="color:red"> ${common}</span>`)
                    copyClientInput01.splice(startOfClient, 13, ...colorCommonElement);
                }               
            }
        }
        return copyClientInput01;
    }
    
    let highlightedText = findCommonElements(arrayClientInput, arrayCompareInput);

    // Join the elements to create a formatted string
    let highlightedTextString = highlightedText.join(' ');

    document.getElementById("output").innerHTML = highlightedTextString;
}
