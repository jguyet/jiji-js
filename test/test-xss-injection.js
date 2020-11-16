let testBattery = [
        { code: "'abc'", validation: "abc" },
        { code: "8*8", validation: "64" },
        { code: "console", validation: "null" },
        { code: "window", validation: "null" },
        { code: "location", validation: "null" },
        { code: "XMLHttpRequest", validation: "null" },
        { code: "console", validation: "null" },
        { code: "eval('1+1+1')", validation: "3" },
        { code: "eval('7/9+1')", validation: "1.7777777777777777" },
        { code: "Date.now()", validation: "null" },
        { code: "document", validation: "null" },
        { code: "/^http:/", validation: "/^http:/" },
        { code: "JSON.stringify({a:0,b:1,c:2})", validation: "null" },
        { code: "HTMLElement", validation: "null" },
        { code: "typeof(window)", validation: typeof(window) == 'undefined' ? "undefined" : "object" },
        { code: "Object.keys(window)", validation: "null" },
        { code: "Object.getOwnPropertyNames(window)", validation: "null" },
        { code: "var result; try{result=window.location.href;}catch(err){result=err.message;}; result;", validation: typeof(window) == 'undefined' ? "window is not defined" : "Cannot read property 'location' of null" },
        { code: "parseInt('z')", validation: "null" },
        { code: "Math.random()", validation: "null" },
        { code: "[1,2,3,4,8].reduce(function(p,c){return p+c;},0);", validation: "18" }
];

function testXSS(assert) {
    let testResult = testBattery.map(function(test){
        const pad="                                                      ";
        var result;
        if (typeof(window) == 'undefined') {
            var JijiNode = require("../jiji");
            result= JijiNode.quarantinedEval('try { '+ test.code +' } catch(e) { undefined }');
        } else {
            result= Jiji.quarantinedEval('try { '+ test.code +' } catch(e) { undefined }');
        }
        if (typeof(result) == "undefined") result = "undefined";
        if (result===null) result = "null";
        assert.equal(test.validation, result.toString());
        return (test.code + pad).slice(0,40) + ": result = " + ("\"" + result + "\"" + pad).slice(0,40) + " : " + (result.toString() === test.validation ? "test OK" : "test KO") + " should be equal(\"" + test.validation + "\")";
    }).join("\n");

    return testResult;
}

if (typeof(window) == 'undefined') {
    describe('Array', function() {
        describe('Test XSS INJECTION', function() {
            it('should test validation OK when the value equals to test plan', function() {
                console.log(testXSS(require('assert')))
            });
        });
    });
} else {
    document.addEventListener('DOMContentLoaded', () => {
        let result = testXSS({ equal: () => {} });
        document.getElementsByTagName("body")[0].style.backgroundColor = "black";
        document.getElementsByTagName("body")[0].style.color = "white";
        document.getElementsByTagName("body")[0].innerHTML = result
            .replace(/\n/gm, "<br>")
            .replace(/OK/gm, "<font color=\"green\">OK</font>")
            .replace(/KO/gm, "<font color=\"red\">KO</font>");
        console.log(result);
    }, false);
}