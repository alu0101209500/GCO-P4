# GCO-P4: Sistema recomendador basado en el contenido

## Introducción y objetivos

El objetivo de esta práctica es implementar un sistema capaz de leer un conjunto de documentos y, para cada uno de ellos, obtener los índices del documento en los que figura cada término, el propio nombre del término, TF, IDF, y TF-IDF. El conjunto de documentos se debe leer desde un fichero txt donde cada línea representa un documento.

Adicionalmente a los requisitos mínimos de la práctica, se han implementado una serie de funcionalidades adicionales:
* Eliminación de términos irrelevantes definidos en un conjunto de palabras de parada.
* Lematización.
* Descarga de resultados en formato csv.

El código se ha desarrollado haciendo uso de HTML, CSS y Javascript.

---

## HTML

El código mostrado a continuación corresponde a la estructura HTML de la página

~~~html
        <h1>Sistema recomendador</h1>
        <h2>Introduzca los siguientes datos:</h2>
        <form>
            <p>Seleccione los documentos</p>
            <input type="file" id="docFile">

            <p>Seleccione los términos de parada</p>
            <select id="sw">
                <option selected value=0>No aplicar</option>
                <option value=1>Inglés</option>
                <option value=2>Español</option>
            </select>
            
            <br>
            <br>
            
            <button type="button" id="btnAccept">Aceptar</button>
            
            <br>
            <br>

            <div id="outputComplete"></div>
        </form>
        <button style="display: none;" id="download">Descargar Ficheros</button>
        <script type="application/javascript" src="../script/main.js"></script>
~~~

Los siguientes elementos permiten interactuar con el código del sistema recomendador:
* Campos input del formulario: Uno de ellos, con id __docFile__, permite cargar un fichero desde la memoria local mientras que el segundo, con id __sw__, permite seleccionar el idioma en el que aplicar los términos de parada y lematización. También permite omitir la aplicación de estos métodos.
* Botón con id __btnAccept__: Inicia el proceso principal.
* Botón con id __download__: Sólo visible una vez se haya obtenido la información deseada para cada documento. Inicia el proceso de descarga de resultados.

---

## Inicialización y lectura de ficheros

Una vez cargado el contenido DOM de la página, se comprueba que el navegador soporte el sistema de ficheros de JS (Mostrando un error por pantalla en caso negativo). A continuación, se definen todas las variables y manejadores de eventos necesarios para procesar la entrada de datos del usuario y obtener los resultados esperados:

~~~javascript
document.addEventListener("DOMContentLoaded", (_) => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        let docs = [];
        let mod = [];
        let similMatrix = [];
        let TFvals;
        let IDFvals;
        let TF_IDFvals;
        let termList;
        let valid = false;
        document.getElementById('docFile').addEventListener('change', (e) => {
            readDocFile(e).then((r) => {
                if(r.length < 1){
                    alert("ERROR: El número de filas es menor a 1")
                    docs = [];
                    valid = false;
                } else {
                    docs = [...r];
                    valid = true;   
                }
            }).catch((err) => {
                alert(err);
                docs = [];
                valid = false;
            });
        });

        document.getElementById('btnAccept').addEventListener('click', (_) => {
            ...
            ...
            ...
        });

    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
});
~~~

El fragmento de código anterior muestra las variables empleadas para almacenar cada resultado intermedio de las operaciones a aplicar, además de un manejador de evento cuyo código se ejecutará cuando el usuario cargue un fichero desde la memoria local. 

* La variable __docs__ almacena los documentos cargados por el usuario, pero su valor se copia en la variable mod. Esto se debe a que algunas funciones modifican el valor de los parámetros de entrada.
* La variable __valid__, cuyo valor por defecto es false, indica si el contenido de los documentos tiene un formato aceptado por el programa. Mientras su valor no cambie a true no será posible procesar los documentos.

Cuando se carga el fichero, se ejecuta la función ___readDocFile___, que devuelve una promesa. En caso de que haya habido algún error durante la lectura, se mostrará por pantalla dicho error, mientras que si la lectura se ha realizado correctamente la promesa se resolverá devolviendo un vector de _"documentos"_, siendo cada documento una cadena de texto.

~~~javascript
async function readDocFile(e){
    return new Promise((resolve, reject) => {
        if(e.target.files[0].type != 'text/plain'){
            reject("FORMATO NO VÁLIDO")
        } else {
            let aux1 = [], aux2 = [];
            fr = new FileReader();
            fr.readAsText(e.target.files[0]);
            fr.onloadend = function() {
                aux2 = [...this.result.split("\n")];
                aux1 = [];
                aux2.forEach((e) => {
                    if(e !== ""){
                        aux1.push(e);
                    }
                });
                resolve(aux1);
            }
        }
    });
}
~~~

Cuando el usuario pulsa el botón etiquetado con el identificador __btnAccept__ se comprueba si la variable __valid__ ha tomado valor true, y de ser así ejecuta las siguientes funciones:

~~~javascript
document.getElementById('btnAccept').addEventListener('click', (_) => {
    if(valid === false){
        alert("Por favor, introduzca una matriz válida para continuar");
    } else {
        swIndex = Number(document.getElementById("sw").value);
        mod = cleanDocuments(docs);
        rawdocs = mod;
        mod = parseStopwords(mod, stepwords[swIndex]);
        mod = stemDocuments(mod, stemdict[swIndex]);
        rawdocs = stemDocuments(rawdocs, stemdict[swIndex]);
        termList = indexTerms(mod);
        TFvals = TF(mod);
        IDFvals = IDF(mod, termList);
        TF_IDFvals = TF_IDF(TFvals, IDFvals);
        drawTables("outputComplete", rawdocs, mod, termList, TFvals, IDFvals, TF_IDFvals);
        similMatrix = calculateSimilarities(TF_IDFvals);
        drawSimilarities("outputComplete", similMatrix);

        let download = document.getElementById("download");
        download.style.display = "block";
        downloadResults(download, rawdocs, mod, termList, TFvals, IDFvals, TF_IDFvals);
    }
});
~~~

* ___cleanDocuments___ recibe el vector de "documentos" (Cadenas de texto) procedente de ___readDocFile___, limpia las cadenas de comas y puntos, descompone cada cadena en un vector de cadenas donde cada posición corresponde a una palabra de la cadena original, y elimina espacios en blanco

* ___parseStopwords___ elimina las cadenas correspondientes a términos de parada.

* ___stemDocuments___ sustituye los términos declinados por su lema.

* ___indexTerms___ crea un listado con todos los términos que aparecen en el documento una vez ha sido limpiado.

* ___TF___ obtiene la frecuencia de los términos en cada documento.

* ___IDF___ obtiene el valor del IDF para cada término.

* ___TF_IDF___ obtiene el valor de TF-IDF para cada término en cada documento.

* ___drawTables___ muestra los resultados por pantalla.

* ___calculateSimilarities___ obtiene el índice de similitud entre cada par de documentos.

* ___drawSimilarities___ muestra la matriz de similitud por pantalla.

* ___dowloadResults___ prepara la descarga de los resultados en formato csv.

---

## Limpieza de documentos, términos de parada y lematización

### cleanDocuments

La limpieza de documentos se realiza mediante la función ___cleanDocuments___:

~~~javascript
function cleanDocuments(inputDocs){
    let docs = [...inputDocs];
    let result = [];

    for (let i = 0; i < docs.length; i ++) {
        docs[i] = docs[i].replace(/\,/g, "");
        docs[i] = docs[i].replace(/\./g, "");
    }

    for (let i = 0; i < docs.length; i ++) {
        docs[i] = docs[i].toLowerCase();
        result.push(docs[i].split(" "));
    }

    for (let i = 0; i < result.length; i ++) {
        for(let j = 0; j < result[i].length; j++){
            if(result[i][j] == "") {
                result[i].splice(j, 1);
                j = 0;
            }
        }
    }

    return result;
}
~~~

Esta función toma como entrada un vector de cadenas, y para cada una de ellas:
* Elimina las comas
* Elimina los puntos
* Descompone la cadena en un vector de palabras
* Elimina las posiciones correspondientes a cadenas vacías

Al finalizar, devuelve el nuevo vector de vectores de cadenas.

### parseStopwords

~~~javascript
function parseStopwords(inputDocs, sw) {
    let result = [];
    for(let i = 0; i < inputDocs.length; i++) {
        result.push([...inputDocs[i]]);
    }

    for (let i = 0; i < result.length; i ++) {
        for(let j = 0; j < result[i].length; j++){
            if(sw.indexOf(result[i][j]) !== -1){
                result[i].splice(j, 1);
                j = 0;
            }            
        }
    }

    return result;
}
~~~

La función recibe como parámetros los documentos y los términos de parada. A continuación, itera sobre cada palabra de cada documento, y suprime aquellas que coincidan con alguno de los términos incluidos en el vector de términos de parada. Los términos de parada están almacenados en una cadena de texto donde el símbolo "@" hace las veces de separador. Al ejectuarse el código por primera vez, se cargan en un vector haciendo uso del método ___split("@")___, y es este vector el que se pasa como parámetro a la función.

### stemDocuments

~~~javascript
function stemDocuments(inputDocs, corpus) {
    let result = [];
    for(let i = 0; i < inputDocs.length; i++) {
        result.push([...inputDocs[i]]);
    }

    for (let i = 0; i < result.length; i ++) {
        for(let j = 0; j < result[i].length; j++){
            if(corpus[result[i][j]] !== undefined) {
                result[i][j] = corpus[result[i][j]];
            }
        }
    }

    return result;
}
~~~

La función recibe como parámetros los documentos y un objeto javascript que contiene el corpus lingüístico. El objeto corpus contiene un atributo por cada palabra declinada que contiene, cuyo nombre es la propia palabra declinada y su valor es el lema. La función itera sobre cada palabra de cada documento y, de existir un atributo cuyo nombre coincida con la palabra evaluada, se sustituye la palabra por el valor del atributo (Se sustituye la declinación por el lema).

El corpus español procede de una librería para el lenguaje R mientras que el corpus inglés procede de un listado de los verbos más comunes del idioma. Originalmente, ambos corpus estaban almacenados en ficheros csv, de modo que se escribió un script sencillo para transformarlos a formato JSON:

~~~javascript
async function readDocFile(e){
    return new Promise((resolve, reject) => {
        if(e.target.files[0].type != 'text/plain' && e.target.files[0].type != 'text/csv'){
            reject("FORMATO NO VÁLIDO")
        } else {
            let aux1 = [], aux2 = [];
            fr = new FileReader();
            fr.readAsText(e.target.files[0]);
            fr.onloadend = function() {
                aux2 = [...this.result.split("\n")];
                aux1 = [];
                aux2.forEach((e) => {
                    if(e !== ""){
                        let txtdummy = e.replace(/\s/g, "");
                        txtdummy = txtdummy.replace(/\./g, "");
                        let arr = txtdummy.split(",");
                        for(let i = 1; i < arr.length; i++) {
                            if(arr[i] != "" && arr[i] != "-"){
                                aux1.push([arr[i], arr[0]]);
                            }
                        }
                    }
                });
                resolve(aux1);
            }
        }
    });
}


function csvtojson(arr){
    let myobj = {};
    for(let i = 0; i < arr.length; i++) {
        myobj[arr[i][0]] = arr[i][1];
    }

    console.log(myobj);

    let divload = document.getElementById("divload");
    let download_btn = document.createElement("button");
    divload.appendChild(download_btn);
    download_btn.innerHTML = "Descarga";

    download_btn.addEventListener("click", (_) => {
        document.getElementById("downloadstatus").innerHTML = "Descargando";
        
        var bb = new Blob([JSON.stringify(myobj) ], { type: 'text/plain' });
        var a = document.createElement('a');
        a.download = 'download.txt';
        a.href = window.URL.createObjectURL(bb);
        a.click();
    });
}
~~~

---

## TF, IDF, TF-IDF

### TF
Para obtener la frecuencia de los términos en cada documento, se emplea la función ___TF___:

~~~javascript
function TF(inputDocs) {
    result = [];
    result.length = inputDocs.length;
    let docs = [];
    for(let i = 0; i < inputDocs.length; i++) {
        docs.push([...inputDocs[i]]);
    }

    for(let i = 0; i < docs.length; i++) {
        result[i] = [];
        while(docs[i].length > 0) {
            let n = 0;
            let val = docs[i][0];
            for(let k = 0; k < docs[i].length; k++){
                if(val === docs[i][k]) {
                    n++;
                    docs[i].splice(k, 1);
                    k = 0;
                }
            }
            result[i].push([val, n]);
        }
    }
    return result;
}
~~~

La función toma como entrada el listado de documentos, y almacena en la variable __docs__ una copia de los mismos. A continuación, itera sobre cada documento de __docs__, contando cuantas veces se repite cada término y almacenando esta información en la variable __result__. La variable result tiene el formato de vector de vectores(documentos) de tuplas de tamaño 2 (parejas de términos - número de apariciones). Este es el resultado que devuelve la función.

### IDF

Para calcular IDF, primero se obtiene un listado con todos los términos que aparecen en el conjunto de documentos haciendo uso de la función ___indexTerms___:

~~~javascript
function indexTerms(inputDocs) {
    let termObj = {};
    let id = 0;
    for(let i = 0; i < inputDocs.length; i++) {
        for(let j = 0; j < inputDocs[i].length; j++) {
            if(termObj[inputDocs[i][j]] == undefined) {
                termObj[inputDocs[i][j]] = id;
                id++;
            }
        }
    }

    console.log(termObj);
    return termObj;
}
~~~

Toma como entrada el conjunto de documentos, crea un nuevo objeto, e itera sobre cada término. Si en el objeto no existe un atributo cuyo nombre coincida con el término, lo crea, y le asigna como valor un identificador único. Al finalizar devuelve este objeto.

A continuación ___IDF___ recibe como parámetros de entrada el conjunto de documentos y este objeto que contiene el listado de términos:

~~~javascript
function IDF(inputDocs, termList) {
    let objIDF = {};
    for (let prop in termList) {
        let n = 0;
        for(let i = 0; i < inputDocs.length; i++) {
            if(inputDocs[i].indexOf(prop) != -1){
                n++;
            }
        }
        objIDF[prop] = Math.log10(inputDocs.length/n);
    }

    return objIDF;
}
~~~

La función itera sobre cada atributo del objeto __termList__ y cuenta el número de documentos en que aparece dicho término. Acto seguido, en el objeto __objIDF__ crea un nuevo atributo con el mismo nombre, y como valor le asigna el IDF - _Log10(Número total de documentos/Número de documentos en los que aparece el término)_. La función devuelve este objeto __objIDF__

### TF-IDF

El cálculo de TF-IDF tiene lugar en la función ___TF_IDF___:

~~~javascript
function TF_IDF(TFvals, IDFvals) {
    let result = [];
    for(let i = 0; i < TFvals.length; i++) {
        result[i] = [];
        for(let j = 0; j < TFvals[i].length; j++) {
            result[i].push([...TFvals[i][j]]);
        }
    }
    for(let i = 0; i < result.length; i++) {
        for(let j = 0; j < result[i].length; j++) {
            result[i][j][1] = Number(result[i][j][1]) * Number(IDFvals[result[i][j][0]]);
        }
    }
    return result;
}
~~~

Esta función recibe como parámetros de entrada el conjunto de valores TF y el objeto con los valores IDF. A continuación, en la variable __result__ se almacena una copia de los valores TF. Iterando sobre cada una de las tuplas de result, se sustituye el valor TF del término por el valor IDF del mismo (Valor TF*Valor IDF). La función devuelve la variable __result__, cuyo formato es idéntico al vector que almacena los valores de TF.

---

## Cálculo de similitud entre documentos

Para calcular la similitud entre cada par de documentos se emplea la función ___calculateSimilarities___:

~~~javascript
function calculateSimilarities(TF_IDFvals) {
    console.log(TF_IDFvals)
    let lg = TF_IDFvals.length
    let result = [];
    result.length = lg;
    for(let i = 0; i < lg; i++) {
        result[i] = []
        result[i].length = lg;
        result[i].fill("");
    }
    
    for (let i = 0; i < lg; i++) {
        for (let j = 0; j <= i; j++) {
            if(i == j) {
                result[i][j] = "1"
            } else {
                result[i][j] = String(adjCos(TF_IDFvals[i], TF_IDFvals[j]));
                result[j][i] = result [i][j];
            }
        }
    }
    return result
}
~~~

Esta función recibe como parámetro de entrada el vector TF_IDF. Este vector contiene un vector por cada documento, que a su vez contiene una tupla _término - valor TF_IDF_ por cada término.

La función genera una matriz NxN vacía donde tanto filas como columnas representan el conjunto de documentos de entrada. Una vez definida la matriz, se procede a completar la misma con los índices de similitud entre cada par de documentos. En primer lugar se marca con un "1" los elementos de la diagonal, pues corresponden a la similitud de un documento consigo mismo.

A continuación, se procede a calcular únicamente los valores correspondientes a las posiciones de la matriz inferior, y acto seguido a copiar su valor en la posición correspondiente de la matriz superior. Esto se debe a que la matriz es simétrica, pues el índice de similitud entre, por ejemplo, el documento 3 y el documento 2 ha de ser idéntico al índice de similitud entre el documento 2 y el documento 3.

Para calcular el índice entre un par de documentos se invoca a la función ___adjCos___, que recibe como parámetros de entrada los vectores de valores TF_IDF de los documentos implicados:

~~~javascript
function adjCos(item1, item2) {
    let U = [];
    for(let i = 0; i < item1.length; i++) {
        for(let j = 0; j < item2.length; j++) {
            if(item1[i][0] == item2[j][0]) {
                U.push(item1[i][0]);
                break;
            }
        }
    }
    let t1 = 0;
    let t2 = 0;
    let t3 = 0;

    for(let i = 0; i < U.length; i++) {    
        let a = 0;
        let b = 0;

        for(let j = 0; j < item1.length; j++) {
            if(U[i] == item1[j][0]) {
                a = item1[j][1];
                break;
            }
        }

        for(let j = 0; j < item2.length; j++) {
            if(U[i] == item2[j][0]) {
                b = item2[j][1];
                break;
            }
        }
        t1 += (a-adjAvg(item1))*(b-adjAvg(item2));
        t2 += Math.pow((a-adjAvg(item1)),2);
        t3 += Math.pow((b-adjAvg(item2)),2);
    }
    
    if(t2 == 0 || t3 == 0) {
        return 0;
    } else {
        return (t1/(Math.sqrt(t2)*Math.sqrt(t3)));
    }
}
~~~

Esta función implementa la fórmula de coseno ajustado. Para que la función sea capaz de operar correctamente, es necesario implementar una función adicional donde se obtenga la media de valores TF_IDF de un documento:

~~~javascript
function adjAvg(item) {
    let val = 0;
    let total = 0;

    for (let i = 0; i < item.length; i++) {
        val += item[i][1];
        total ++;
    }
    if(total == 0) {
        return 0;
    } else {
        return val / total;
    }
}
~~~

---

## Impresión de resultados por pantalla

Se han definido dos funciones para mostrar los resultados por pantalla:
* ___drawTables___ para imprimir por pantalla los resultados obtenidos al calcular TF, IDF, TF-IDF,
* ___drawSimilarities___ para imprimir la matriz de similitud entre documentos.

___drawTables___:
~~~javascript
function drawTables(divid, rawdocs, inputDocs, termList, TFvals, IDFvals, TF_IDFvals) {
    console.log(rawdocs)
    let docs = [];
    docs.length = inputDocs.length;
    let str = "<br><br>";

    for(let i = 0; i < inputDocs.length; i++) {
        docs[i] = [];
        for(let j = 0; j < inputDocs[i].length; j++) {
            if(docs[i].indexOf(inputDocs[i][j]) == -1) {
                docs[i].push(inputDocs[i][j]);
            }
        }

        str += "<h3>Documento " + String(i+1) + "</h3> <br> <table class=\"tablebackground\">";
        str += `<tr class="cabecera"><th>ID </th><th>Nombre </th><th>TF </th><th>IDF </th><th>TF-IDF </th></tr>`;
        for(let j = 0; j < docs[i].length; j++) {
            let indexlist = "[";
            let auxarr = [];  
            for(let k = 0; k < rawdocs[i].length; k++) {
                
                if(docs[i][j] == rawdocs[i][k]) {
                    auxarr.push(k);
                }
            }
            indexlist += auxarr.join(",");
            indexlist += "]";
            let tfval = TFvals[i][TFvals[i].findIndex((e) => e[0] == docs[i][j])];
            let tfidfval = TF_IDFvals[i][TF_IDFvals[i].findIndex((e) => e[0] == docs[i][j])];
            str += `<tr>`
            str += `<th> ${indexlist} </th>`;
            str += `<th> ${docs[i][j]} </th>`;
            str += `<th> ${tfval[1]} </th>`;
            str += `<th> ${Number(IDFvals[docs[i][j]])} </th>`;
            str += `<th> ${tfidfval[1]} </th>`;
            str += "</tr>";
        }
        str += "</table><br><br>"
    }

    document.getElementById(divid).innerHTML = str;
}
~~~

___drawSimilarities___:

~~~javascript
function drawSimilarities(divid, similMatrix) {
    
    let str = "<br><br>";
    str += "<h3>Matriz de similitud entre documentos</h3> <br> <table class=\"tablebackground\">";
    str += `<tr class="cabecera"><th> / </th>`
    
    for(let i = 0; i < similMatrix.length; i++) {
        str += '<th> Doc ' + String(i+1) + '</th>';
    }
    str += '</tr>'

    for(let i = 0; i < similMatrix.length; i++) {
        str += '<tr>';
        str += '<th class="cabecerath"> Doc ' + String(i + 1) + '</th>'
        for(let j = 0; j < similMatrix[i].length; j++) {
            str += '<th>' + similMatrix[i][j] + '</th>';            
        }
        str += "</tr>";
    }
    str += '</table>'

    document.getElementById(divid).innerHTML += str;
}
~~~

En ambas funciones se manipula el DOM de la página para mostrar los resultados siguiendo un formato de tabla de HTML

---

## Descarga de resultados

La función ___downloadResults___ hace posible la descarga de resultados.

~~~javascript
function downloadResults(download, rawdocs, inputDocs, termList, TFvals, IDFvals, TF_IDFvals) {
    let docs = [];
    docs.length = inputDocs.length;

    download.addEventListener("click", (_) => {
        for(let i = 0; i < inputDocs.length; i++) {
            let str = "";
            docs[i] = [];
            for(let j = 0; j < inputDocs[i].length; j++) {
                if(docs[i].indexOf(inputDocs[i][j]) == -1) {
                    docs[i].push(inputDocs[i][j]);
                }
            }
    
            str += `ID,Nombre,TF,IDF,TF-IDF\n`;
            for(let j = 0; j < docs[i].length; j++) {
                let indexlist = "";
                let auxarr = [];  
                for(let k = 0; k < rawdocs[i].length; k++) {
                    
                    if(docs[i][j] == rawdocs[i][k]) {
                        auxarr.push(k);
                    }
                }
                indexlist = auxarr.join(" ");
                let tfval = TFvals[i][TFvals[i].findIndex((e) => e[0] == docs[i][j])];
                let tfidfval = TF_IDFvals[i][TF_IDFvals[i].findIndex((e) => e[0] == docs[i][j])];
                str += `${indexlist},`;
                str += `${docs[i][j]},`;
                str += `${tfval[1]},`;
                str += `${Number(IDFvals[docs[i][j]])},`;
                str += `${tfidfval[1]}\n`
            }
    
            let downloadFile = new Blob([str], {type: 'text/plain'});
            let auxlink = document.createElement("a");
            auxlink.download = "Doc" + String(i+1) + ".csv";
            auxlink.href = window.URL.createObjectURL(downloadFile);
            auxlink.click();
        }
    });
}
~~~

Cuando todos los resultados han sido obtenidos, se llama a esta función, que hace visible el botón de descarga y define un manejador de evento que ejecuta un bloque de código cuando el usuario hace click en el botón.

Cuando el usuario hace click, se itera sobre cada documento, almacenando en una cadena la información relativa a cada término en formato csv. Posteriormente, se hace uso de un objeto Blob y del método ___createObjectURL___ para asignar a un enlace la ruta al fichero de descarga. Este enlace es activado mediante el método ___click___, iniciando la descarga del fichero.

---

## Bibliografía

* Corpus en español: https://torres.epv.uniovi.es/centon/lematizador-espanol-r.html
* Corpus en inglés: https://gitlab.beuth-hochschule.de/s76343/snorkel-ner-task/blob/994bdeffdd091c07629b1b0acb9dfa6dfad6ccf9/data/most-common-verbs-english.csv
