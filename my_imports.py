import time
import document

class g:
    listCount = 0

class Debug:
    debugMode = False
    def log(s):
        if Debug.debugMode:
            print "<span class='blue-text'>" + s + "</span>",
    def logln(s):
        if Debug.debugMode:
            print "<span class='blue-text'>" + s + "</span>"
        
class Dom:
    animate = False
    delay = 1
    def create(kwargs):
        if "tag" in kwargs:
            tag = kwargs["tag"]
        else:
            tag = "div"
        elem = document.createElement(tag)
        
        if "html" in kwargs:
            elem.innerHTML = kwargs.pop("html")
            
        for key in kwargs:
            elem.setAttribute(key, kwargs[key])
        return elem
    def get(key):
        if len(key) == 0:
            return None
        elif key[0] == "#":
            return document.getElementById(key[1:])
        elif key[0] == ".":
            return document.getElementsByClassName(key[1:])
        else:
            return document.getElementsByTagName(key)
    def appendAnimate(parent, elem):
        classNames = elem.getAttribute("class") + " hidden"
        elem.setAttribute("class", classNames)
        parent.appendChild(elem)
        time.sleep(0.1)
        elem.setAttribute("class", classNames.replace("hidden", ""))
        time.sleep(Dom.delay)
    def appendInstant(parent, elem):
        parent.appendChild(elem)
    def append(parent, elem):
        if Dom.animate:
            Dom.appendAnimate(parent, elem)
        else:
            Dom.appendInstant(parent, elem)
    def removeAnimate(parent, elem):
        classNames = elem.getAttribute("class") + " hidden"
        elem.setAttribute("class", classNames)
        time.sleep(Dom.delay)
        parent.removeChild(elem)
    def removeInstant(parent, elem):
        parent.removeChild(elem)
    def remove(parent, elem):
        if Dom.animate:
            Dom.removeAnimate(parent, elem)
        else:
            Dom.removeInstant(parent, elem)

def setDebugMode(b):
    Debug.debugMode = b

def setAnimate(b):
    Dom.animate = b
        

class List(list):
    PARENT_ID = "list-visual-area"
    CLASS = "list-block"
    ITEM_CLASS = "list-block-item"
    NAME_CLASS = "list-name"
    
    def getDomId(self):
        return List.CLASS + str(self.id)
    
    def getItemClass(self):
        # used for css stylings
        genericClass = List.ITEM_CLASS
        
        # unique id differentiates one objects specificClass from another
        specificClass = List.ITEM_CLASS + str(self.id)
        return genericClass + " " + specificClass
    
    def __init__(self, lst, **kwargs):
        if "name" in kwargs:
            self.name = kwargs["name"]
        else:
            self.name = "list"
        Debug.log("Creating list: " + str(lst) + "...")
        g.listCount += 1
        self.id = g.listCount # unique id

        # create dom elem for list
        self.domElem = Dom.create({
            "tag": "div",
            "id": self.getDomId(),
            "class": List.CLASS
        })
        
        listNameElem = Dom.create({
            "tag": "div",
            "class": List.NAME_CLASS,
            "html": self.name
        })
        
        Dom.appendInstant(self.domElem, listNameElem)
        
        # create dom elem for each item in list and append it to 
        # the list dom elem
        for item in lst:
            listItemElem = Dom.create({
                "tag": "div",
                "class": self.getItemClass(),
                "html": item
            })
            Dom.appendInstant(self.domElem, listItemElem)

        # append dom list to the dom
        listArea = Dom.get("#" + List.PARENT_ID)
        Dom.append(listArea, self.domElem)
        
        Debug.logln("created")
        
    def append(self, item):
        Debug.log("Appending %s to %s..." % (item,self))
        # create dom elem for the list item
        listItemElem = Dom.create({
            "tag": "div",
            "class": self.getItemClass(),
            "html": item
        })
        
        # append the dom elem to the list
        Dom.append(self.domElem, listItemElem)
        
        list.append(self, item)
        Debug.logln("result: %s" % (self,))
        
    def remove(self, item):
        Debug.log("Removing %s from %s..." % (item,self))
        listItemElems = Dom.get("." + self.getItemClass())
        for listItem in listItemElems:
            if listItem.innerHTML == str(item):
                Dom.remove(self.domElem, listItem)
                break
        list.remove(self, item)
        Debug.logln("result: %s" % (self,))
        
def clearLists():
    listArea = Dom.get("#" + List.PARENT_ID)
    listArea.innerHTML = ""
     
clearLists()