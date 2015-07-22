CODE_KEY = "CODE_KEY";

window.libStr = "";

var sampleCode = "setAnimate(True)\n"+
                 "setDebugMode(True)\n"+
                 "\n"+
                 "numList = [2,3,4]\n"+
                 "numList.append(5)\n"+
                 "numList.append(6)\n"+
                 "numList.remove(4)\n"+
                 "\n"+
                 "for i in range(0,2):\n"+
                 "    numList.append(i)\n"+
                 "\n"+
                 "print('Done with numList operations')\n"+
                 "\n"+
                 "strList = ['hey', 'there']\n"+
                 "strList.append('friend')\n"+
                 "strList.remove('friend')\n"+
                 "strList.append('buddy')"

// init code mirror
var editor = CodeMirror($("#editor")[0], {
    mode:  "python",
    indentUnit: 4,
    keyMap: "sublime",
    extraKeys: {
        Tab: function(cm) {
            var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
            cm.replaceSelection(spaces);
        }
    },
    lineNumbers: true,
    lineWrapping: true,
    showCursorWhenSelecting: true,
    autoCloseBrackets: true,
    matchBrackets: true
});

// init skulpt
$(document).delegate('#code-input', 'keydown', function(e) {
  var keyCode = e.keyCode || e.which;

  if (keyCode == 9) {
    e.preventDefault();
    var start = $(this).get(0).selectionStart;
    var end = $(this).get(0).selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    $(this).val($(this).val().substring(0, start)
                + "\t"
                + $(this).val().substring(end));

    // put caret at right position again
    $(this).get(0).selectionStart =
    $(this).get(0).selectionEnd = start + 1;
  }
});

function outputFunc(text){
    $("#code-output").append(text);
}
function builtinRead(x){
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined){
        throw "File not found: '" + x + "'";
    }
    return Sk.builtinFiles["files"][x];
}

$("#run-btn").click(function(){
    runCode();
});

function runPythonCode(code){
    $("#code-output").html("");
    Sk.pre = "code-output";
    Sk.configure({
        output: outputFunc,
        read: builtinRead
    });
    // (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "canvas-area";
    var myPromise = Sk.misceval.asyncToPromise(function(){
        return Sk.importMainWithBody("<stdin>", false, code, true);
    });
    myPromise.then(function(mod){
        console.log("success");
    }, function(err){
        $("#code-output").append("<span class='red-text'>" + err.toString() + "</span>");
        console.error(err.toString());
    });
}

// load python lib
$.ajax({
    url: "my_imports.py",
    dataType: "text",
    success: function(data){
        window.libStr = data + "\n";
    },
    error: function(err){
        console.error(err);
    }
});

var feedbackMsgTimeout;
function showFeedbackMsg(){
    $("#feedback-msg").removeClass("hidden");
    window.clearTimeout(feedbackMsgTimeout);
    feedbackMsgTimeout = setTimeout(function(){
        $("#feedback-msg").addClass("hidden");
    }, 1000);
}
function saveCode(){
    var code = editor.getValue();
    localStorage.setItem(CODE_KEY, code);
    $("#feedback-msg").html("saved");
    showFeedbackMsg();
}
function runCode(){
    var rawCode = editor.getValue();

    // replace list assignments to use the custom list
    // i.e. lst = [1,2,3] becomes
    // lst = List([1,2,3],name='list')
    var listRegex = /(\w+)\s+=\s+\[(.*?)\]/g
    var matchArr = rawCode.match(listRegex);
    for (var i = 0; i < matchArr.length; i++){
        matchedStr = matchArr[i]
        var capturedArr = /(\w+)\s+=\s+\[(.*?)\]/g.exec(matchedStr)
        var listName = capturedArr[1];
        var listValues = capturedArr[2];
        var newListStr = listName + " = List([" + listValues + "],name='" + listName + "')";
        rawCode = rawCode.replace(matchedStr, newListStr)

    }
    console.log(rawCode);

    var code = window.libStr + rawCode
    // var code = rawCode;
    runPythonCode(code);
    $("#feedback-msg").html("running code");
    showFeedbackMsg();
}

function loadCode(){
    var savedCode = localStorage.getItem(CODE_KEY);
    if (savedCode === undefined || savedCode === null){
        savedCode = sampleCode;
    }
    editor.setValue(savedCode);
}

// init keypress handler
$("#editor").keydown(function(e) {
    if ((e.metaKey || e.ctrlKey) && e.which == 83){
        // cmd + s or ctrl + s pressed
        e.preventDefault();
        saveCode();
    }
    if ((e.metaKey || e.ctrlKey) && e.which == 82){
        // cmd + r or ctrl + r pressed
        e.preventDefault();
        runCode();
    }
});

$(document).ready(function(){
    loadCode();
});
