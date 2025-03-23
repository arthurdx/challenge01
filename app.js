const { readFileSync, appendFile } = require("fs");

const data = readFileSync("data01.json");
const products = JSON.parse(data);

// 1 - dividir o produto em pedaços. tipo, variação, marca e tamanho.
// 2 - assumir que o tipo é sempre a primeira substring e o tamanho é sempre a última substring.
// variação e marca costumam ser as substrings do meio mas variam de posição entre elas.
// Ex: Leite Integral Piracanjuba 1L.
// Ex2: Leite Piracanjuba Integral 1L.
// Tipo: Leite, Variação: Integral Marca: Piracanjuba, Tamanho: 1L
// tipo e tamanho se sempre são 0 e -1 respectivamente.
// 3 - normalizar tamanho para 1 unidades de medida. l, litros, litro, ml / 1000 -> l. 
// kg, quilos, quilo, g / 1000 -> kg
// 4 - organizar alfabeticamente as substrings entre as posições 0 e -1 
// 5 - juntar as substrings organizadas com o tamanho normalizado.

const removeSpaceAndAccentuation = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const processProduct = (product) => {
    // passo 1
    const normalizedSplitTitle = removeSpaceAndAccentuation(product.title)
        .toLowerCase()
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ");
    // passo 2
    const productType = normalizedSplitTitle[0];
    const productSize = normalizedSplitTitle[normalizedSplitTitle.length - 1];
    // passo 3
    const normalizedSize = normalizeSize(productSize);
    const productVariation = normalizedSplitTitle.slice(1, normalizedSplitTitle.length - 1).join(" ");
    // passo 4
    const sortedVariation = productVariation.split(" ").sort().join(" ");
    // passo 5
    const key = productType + " " + sortedVariation + " " + normalizedSize;
    return key;
}

const normalizeSize = (size) => {
    const volumeRegex = /(\d+(?:\.\d+)?)\s*(l|litros?|ml)/i;
    const weightRegex = /(\d+(?:\.\d+)?)\s*(kg|quilo?s?|g|gramas?)/i;
    
    let normalizedSize = null;
    
    const volumeMatch = size.match(volumeRegex);
    if (volumeMatch) {
        let amount = parseFloat(volumeMatch[1]);
        let unit = volumeMatch[2].toLowerCase();
        
        if (unit === "ml") {
            amount /= 1000;
        }
        normalizedSize = amount + "L";
    }
    
    const weightMatch = size.match(weightRegex);
    if (weightMatch) {
        let amount = parseFloat(weightMatch[1]);
        let unit = weightMatch[2].toLowerCase();
        
        // Converter para quilos se necessário
        if (unit === "g" || unit.includes("grama")) {
            amount /= 1000;
        }
        normalizedSize = amount + "kg";
    }
    
    return normalizedSize || size;
}

const categorizeProducts = (products) => {
    const categories = new Map();

    products.forEach(product => {
        const key = processProduct(product);
        if (!Object.keys(categories).includes(key)) {
            categories[key] = {
                category: product.title,
                count: 0,
                products: []
            };
        }
        categories[key].count++;
        categories[key].products.push({
            title: product.title,
            supermarket: product.supermarket
        });
    });

    return Object.values(categories);

};

console.log(JSON.stringify(categorizeProducts(products), null, 2));
