/**
 * @Filename: debugger.js
 * @Author:   Leonidio Koester Junior (koesterjunior0350)
 * @Date:     2023-02-04
 * @Purpose:  Provides tools for debugging inside Webstorm's preview
 * */

"use strict";

let output = "";
let lines = [];


/**
 * In case of any error, let's override "window.onerror" to make it
 * shows us what went wrong inside the page itself
 * */
window.onerror = function (a, b, c, d){
    if ( debugging.initialized )
        debugging.write("", [`<em>${a}\n${b}:${c}@${d}</em>`]);
    else
        alert( `${a}\n${b}\n${c}\n${d}` );
    return false;
};



const make = ( type, attributes, parent ) => {
    const obj = document.createElement(type);

    for ( let attr in attributes ){
        const value = attributes[attr];

        if ( typeof value == "function" )
            obj[attr] = value;

        else if ( typeof value === "object" )
            for ( let val in value )
                obj[attr][val] = value[val];

        else
            obj.setAttribute( attr, value );

    }

    (parent||document.body).appendChild(obj);

    return obj;
}


const makeCSS = ( styles ) => {
    let result = "";

    for ( let selector in styles ) {
        result += `${selector} { `;

        for ( let attr in styles[selector] ){
            let value = styles[selector][attr];

            attr = attr.replace(/([A-Z])/,"-$1").toLowerCase();
            if ( isFinite(value) && value > 0 && attr.match(/padding|width|height|margin/) ) value += "px";

            result += `${attr}: ${value}; `;
        }

        result += ` } `;
    }

    return result;
}





/**
 * A very simple page writer
 * */
const debugging = {

    write: ( content, array ) => {
        const ref = document.getElementById( "logList" );
        try {
            if ( array && array.length )
                content += "<ol>" + array.map((v)=>{ return `<li>${v}</li>` }).join("\n") + "</ol>";
            if ( !content ) content = "<sub>Nothing to <strong>output</strong></sub>";
        }
        catch ( e ){ content = `window.page Error: <em>${e}</em>`; }
        ref.innerHTML += content.replace(/\n|\r/g,"<br/>");
        ref.scrollTo( 0, ref.scrollHeight );
        output = "";
        lines = [];
        document.body.style.paddingBottom = document.getElementById("logList").clientHeight+"px";
    },

    initialized: false,

    initialize: function(){

        // makes sure that #logList exists
        let logList = document.getElementById("logList");
        if ( !logList ) {
            make("div", { id: "logList" });
            make("style").innerText = makeCSS({
                "#logList": {
                    position: "fixed",
                    bottom: 0,
                    right: 0,
                    left: 0,
                    padding: 10,
                    maxHeight: 100,
                    overflow: "auto",
                    backgroundColor: "rgba(43,43,43,255)",
                    color: "#bababa",
                    fontFamily: "Consolas, monospace",
                    fontWeight: "lighter"
                },
                "#logList:empty": { display: "none" },
                "#logList ol": {
                    listStyle: "none",
                    paddingLeft: 0
                },
                "#logList ol > li:before": {
                    content: "'> '"
                },
                "#logList em": {
                    color: "red"
                }
            });
        }


        /*
         * When working from inside Webstorm's browser preview,
         * we need to override "console.log" to make it work for us
         * */
        if ( navigator.userAgent.indexOf("Edg/") === -1 ){
            console.Log = console.log;
            console.log = function(){
                for ( let arg of arguments )
                    lines.push( arg );
                debugging.write( "", lines );
                console.Log.apply( this, arguments );
            };
        }

        this.initialized = true;
    }
};

debugging.initialize();



