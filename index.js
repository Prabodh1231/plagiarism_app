function compareText() {
    // Get the text inputs from the HTML elements
    let clientInput = document.getElementById("clientInput").value;
    let compareInput = document.getElementById("compareInput").value;

    // Remove the special characters and making text to all lowerCases
    let cleanedClientInput = clientInput.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();
    let cleanedCompareInput = compareInput.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();

    // Split the input texts into arrays of words
    let arrayClientInput = cleanedClientInput.split(" ");
    let arrayCompareInput = cleanedCompareInput.split(" ");
    
    // Get the lengths of the input arrays
    let sizeOfcompairArray = arrayCompareInput.length;
    let sizeOfClientInput = arrayClientInput.length;

    // Function to find and highlight common elements
    function findCommonElements(array1, array2) {
        // Create two separate copies of the input array
        let copyClientInput01 = [...array1]; // Copy 1
        let copyClientInput02 = [...array1]; // Copy 2
        
        for (let i = 0; i < sizeOfcompairArray; i++) {
            let startOfCompare = i;
            let endOfCompare = i + 13;
            let compareOther = arrayCompareInput.slice(startOfCompare, endOfCompare);
            
            for (let index = 0; index < sizeOfClientInput; index++) {
                let startOfClient = index;
                let endOfClient = index + 13;
                let compareClient = copyClientInput02.slice(startOfClient, endOfClient);
                
                // Check if all elements in compareClient exist in compareOther
                if (compareClient.every(compare => compareOther.includes(compare))) {
                    // If so, create a highlighted version with red color
                    let colorCommonElement = compareClient.map((common) => `<span style="color:red">${common}</span>`)
                    // Replace the corresponding section in copyClientInput01 with the highlighted version
                    copyClientInput01.splice(startOfClient, 13, ...colorCommonElement);
                }               
            }
        }
        // Return the modified copy of the input array
        return copyClientInput01;
    }
    
    // Call the findCommonElements function to highlight common elements
    let highlightedText = findCommonElements(arrayClientInput, arrayCompareInput);

    // Join the elements to create a formatted string
    let highlightedTextString = highlightedText.join(' ');

    // Display the highlighted text in the HTML output element
    document.getElementById("output").innerHTML = highlightedTextString;
}
