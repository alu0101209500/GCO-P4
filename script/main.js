let strEng = "able@about@above@abroad@according@accordingly@across@actually@adj@after@afterwards@again@against@ago@ahead@ain't@all@allow@allows@almost@alone@along@alongside@already@also@although@always@am@amid@amidst@among@amongst@an@and@another@any@anybody@anyhow@anyone@anything@anyway@anyways@anywhere@apart@appear@appreciate@appropriate@are@aren't@around@as@a's@aside@ask@asking@associated@at@available@away@awfully@back@backward@backwards@be@became@because@become@becomes@becoming@been@before@beforehand@begin@behind@being@believe@below@beside@besides@best@better@between@beyond@both@brief@but@by@came@can@cannot@cant@can't@caption@cause@causes@certain@certainly@changes@clearly@c'mon@co@co.@com@come@comes@concerning@consequently@consider@considering@contain@containing@contains@corresponding@could@couldn't@course@c's@currently@dare@daren't@definitely@described@despite@did@didn't@different@directly@do@does@doesn't@doing@done@don't@down@downwards@during@each@edu@eg@eight@eighty@either@else@elsewhere@end@ending@enough@entirely@especially@et@etc@even@ever@evermore@every@everybody@everyone@everything@everywhere@ex@exactly@example@except@fairly@far@farther@few@fewer@fifth@first@five@followed@following@follows@for@forever@former@formerly@forth@forward@found@four@from@further@furthermore@get@gets@getting@given@gives@go@goes@going@gone@got@gotten@greetings@had@hadn't@half@happens@hardly@has@hasn't@have@haven't@having@he@he'd@he'll@hello@help@hence@her@here@hereafter@hereby@herein@here's@hereupon@hers@herself@he's@hi@him@himself@his@hither@hopefully@how@howbeit@however@hundred@i'd@ie@if@ignored@i'll@i'm@immediate@in@inasmuch@inc@inc.@indeed@indicate@indicated@indicates@inner@inside@insofar@instead@into@inward@is@isn't@it@it'd@it'll@its@it's@itself@i've@just@k@keep@keeps@kept@know@known@knows@last@lately@later@latter@latterly@least@less@lest@let@let's@like@liked@likely@likewise@little@look@looking@looks@low@lower@ltd@made@mainly@make@makes@many@may@maybe@mayn't@me@mean@meantime@meanwhile@merely@might@mightn't@mine@minus@miss@more@moreover@most@mostly@mr@mrs@much@must@mustn't@my@myself@name@namely@nd@near@nearly@necessary@need@needn't@needs@neither@never@neverf@neverless@nevertheless@new@next@nine@ninety@no@nobody@non@none@nonetheless@noone@no-one@nor@normally@not@nothing@notwithstanding@novel@now@nowhere@obviously@of@off@often@oh@ok@okay@old@on@once@one@ones@one's@only@onto@opposite@or@other@others@otherwise@ought@oughtn't@our@ours@ourselves@out@outside@over@overall@own@particular@particularly@past@per@perhaps@placed@please@plus@possible@presumably@probably@provided@provides@que@quite@qv@rather@rd@re@really@reasonably@recent@recently@regarding@regardless@regards@relatively@respectively@right@round@said@same@saw@say@saying@says@second@secondly@see@seeing@seem@seemed@seeming@seems@seen@self@selves@sensible@sent@serious@seriously@seven@several@shall@shan't@she@she'd@she'll@she's@should@shouldn't@since@six@so@some@somebody@someday@somehow@someone@something@sometime@sometimes@somewhat@somewhere@soon@sorry@specified@specify@specifying@still@sub@such@sup@sure@take@taken@taking@tell@tends@th@than@thank@thanks@thanx@that@that'll@thats@that's@that've@the@their@theirs@them@themselves@then@thence@there@thereafter@thereby@there'd@therefore@therein@there'll@there're@theres@there's@thereupon@there've@these@they@they'd@they'll@they're@they've@thing@things@think@third@thirty@this@thorough@thoroughly@those@though@three@through@throughout@thru@thus@till@to@together@too@took@toward@towards@tried@tries@truly@try@trying@t's@twice@two@un@under@underneath@undoing@unfortunately@unless@unlike@unlikely@until@unto@up@upon@upwards@us@use@used@useful@uses@using@usually@v@value@various@versus@very@via@viz@vs@want@wants@was@wasn't@way@we@we'd@welcome@well@we'll@went@were@we're@weren't@we've@what@whatever@what'll@what's@what've@when@whence@whenever@where@whereafter@whereas@whereby@wherein@where's@whereupon@wherever@whether@which@whichever@while@whilst@whither@who@who'd@whoever@whole@who'll@whom@whomever@who's@whose@why@will@willing@wish@with@within@without@wonder@won't@would@wouldn't@yes@yet@you@you'd@you'll@your@you're@yours@yourself@yourselves@you've@zero";
let strEsp = "algún@alguna@algunas@alguno@algunos@ambos@ampleamos@ante@antes@aquel@aquellas@aquellos@aqui@arriba@atras@bajo@bastante@bien@cada@cierta@ciertas@cierto@ciertos@como@con@conseguimos@conseguir@consigo@consigue@consiguen@consigues@cual@cuando@dentro@desde@donde@dos@el@ellas@ellos@empleais@emplean@emplear@empleas@empleo@en@encima@entonces@entre@era@eramos@eran@eras@eres@es@esta@estaba@estado@estais@estamos@estan@estoy@fin@fue@fueron@fui@fuimos@gueno@ha@hace@haceis@hacemos@hacen@hacer@haces@hago@incluso@intenta@intentais@intentamos@intentan@intentar@intentas@intento@ir@la@largo@las@lo@los@mientras@mio@modo@muchos@muy@nos@nosotros@otro@para@pero@podeis@podemos@poder@podria@podriais@podriamos@podrian@podrias@por@porqué@porque@primero@puede@pueden@puedo@quien@sabe@sabeis@sabemos@saben@saber@sabes@ser@si@siendo@sin@sobre@sois@solamente@solo@somos@soy@su@sus@también@teneis@tenemos@tener@tengo@tiempo@tiene@tienen@todo@trabaja@trabajais@trabajamos@trabajan@trabajar@trabajas@trabajo@tras@tuyo@ultimo@un@una@unas@uno@unos@usa@usais@usamos@usan@usar@usas@uso@va@vais@valor@vamos@van@vaya@verdad@verdadera@verdadero@vosotras@vosotros@voy@yo";

const stepwords = [[], strEng.split("@"), strEsp.split("@")];

// Inicialización:
document.addEventListener("DOMContentLoaded", (_) => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        let docs = [];
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
            if(valid === false){
                alert("Por favor, introduzca una matriz válida para continuar");
            } else {
                swIndex = Number(document.getElementById("sw").value);
                cleanDocuments(docs, stepwords[swIndex]);
            }
        });

    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
});

//Manejo de ficheros
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

function cleanDocuments(inputDocs, sw){
    let docs = [...inputDocs];
    let result = [];
    for (let i = 0; i < docs.length; i ++) {
        docs[i] = docs[i].replace(/\,/g, "");
        docs[i] = docs[i].replace(/\./g, "");
    }

    console.log(docs);
    for (let i = 0; i < docs.length; i ++) {
        docs[i] = docs[i].toLowerCase();
        result.push(docs[i].split(" "));
    }
    console.log(result);

    
    for (let i = 0; i < result.length; i ++) {
        for(let j = 0; j < result[i].length; j++){
            if(sw.indexOf(docs[i][j]) !== -1){
                docs[i].splice(j, 1);
            }            
        }
    }
    console.log(result);
}