function compareText() {
    let clientInput = document.getElementById("clientInput").value;
    let compareInput = document.getElementById("compareInput").value;

    let arrayClientInput = clientInput.split(" ");
    let arrayCompareInput = compareInput.split(" ");
    let sizeOfcompairArray = arrayCompareInput.length - 13;
    let sizeOfClientInput = arrayClientInput.length - 13;

    function findCommonElements(array1, array2) {
        let copyClientInput01 = arrayClientInput; // Create a copy
        let copyClientInput02 = arrayClientInput; // Create another copy
        let startOfCompare = 0;
        let endOfCompare = 13;

        for (let i = 0; i < sizeOfcompairArray; i++) {
            let compareOther = arrayCompareInput.slice(startOfCompare, endOfCompare);
            let startOfClient = 0;
            let endOfClient = 13;
            for (let index = 0; index < sizeOfClientInput; index++) {
                let compareClient = copyClientInput02.slice(startOfClient, endOfClient);
                if (compareClient.every(compare => compareOther.includes(compare))) {
                    let colorCommonElement = compareClient.map((common) => `<span style="color:red"> ${common}</span>`)
                    copyClientInput01.splice(startOfClient, 13, ...colorCommonElement);
                    startOfClient += 13;
                    endOfClient += 13;
                    //console.log(startOfClient)
                } 
                else {
                    startOfClient ++;
                 //   console.log(startOfClient)
                    endOfClient ++;
                }
                
            }
            startOfCompare++;
            console.log(startOfCompare)
            endOfCompare++;
        }
        return copyClientInput01;
    }
    
    let highlightedText = findCommonElements(arrayClientInput, arrayCompareInput);

    // Join the elements to create a formatted string
    let highlightedTextString = highlightedText.join(' ');

    document.getElementById("output").innerHTML = highlightedTextString;
}
