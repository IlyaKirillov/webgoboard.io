"use strict";

/**
 * Copyright 2015 the HtmlGoBoard project authors.
 * All rights reserved.
 * Project  WebSDK
 * Author   Ilya Kirillov
 * Date     26.06.15
 * Time     23:10
 */
var oGameTree   = null;
var nMenuHeight = 50;

function LoadMenu(sActive)
{
    var oMenu = document.createElement("div");

    oMenu.id                    = "menuId";
    oMenu.style.zIndex          = 0xffffffff;
    oMenu.style.position        = "fixed";
    oMenu.style.top             = "0px";
    oMenu.style.left            = "0px";
    oMenu.style.fontSize        = "12px";
    oMenu.style.fontFamily      = "'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif";
    oMenu.style.cursor          = "default";
    oMenu.style.width           = "100%";
    oMenu.style.height          = "50px";
    oMenu.style.backgroundColor = "rgb(5, 7, 8)";

    var oMenuTabs = document.createElement("div");

    oMenuTabs.style["float"] = "left";
    oMenuTabs.style.height   = "50px";
    oMenuTabs.style.position = "relative";

    oMenu.appendChild(oMenuTabs);
    document.body.appendChild(oMenu);

    function AddMenuItem(sLink, sTitle, bActive)
    {
        var TabPanel = oMenuTabs;

        var DivTab                      = document.createElement("div");
        DivTab.style.transitionProperty = "width,height,background,margin,border,padding";
        DivTab.style.transitionDuration = ".25s";

        DivTab.style.float   = "left";
        DivTab.style.height  = "100%";
        DivTab.style.margin  = "0px";
        DivTab.style.padding = "0px";

        if (true !== bActive)
            DivTab.style.backgroundColor = "transparent";
        else
            DivTab.style.backgroundColor = "#737373";

        var NewTab      = document.createElement("button");
        NewTab.tabIndex = "0";

        NewTab.style.background                = "none";
        NewTab.style.outline                   = "none";
        NewTab.style.cursor                    = "pointer";
        NewTab.style["-webkit-appearance"]     = "none";
        NewTab.style["-webkit-border-radius"]  = "0";
        NewTab.style.overflow                  = "visible";
        NewTab.style.fontFamily                = '"Segoe UI",Helvetica,Tahoma,Geneva,Verdana,sans-serif';
        NewTab.style["-webkit-font-smoothing"] = "antialiased";
        NewTab.style.padding                   = "0px";
        NewTab.style.border                    = "1px solid transparent";
        NewTab.style.boxSizing                 = "border-box";

        NewTab.style.fontSize = "14px";
        NewTab.style.height   = "100%";
        NewTab.style.margin   = "0px";
        NewTab.style.padding  = "0px 14px 0px 14px";
        NewTab.style.color    = "#fff";

        NewTab.style.float = "left";

        var NewTabDiv              = document.createElement("div");
        var oHref                  = document.createElement("a");
        oHref.href                 = sLink;
        oHref.title                = sTitle;
        oHref.innerHTML            = sTitle;
        oHref.style.color          = "inherit";
        oHref.style.textDecoration = "inherit";

        NewTabDiv.appendChild(oHref);
        NewTabDiv.onselectstart    = function ()
        {
            return false;
        };
        NewTab.appendChild(NewTabDiv);

        DivTab.onmouseover = function ()
        {
            DivTab.style.backgroundColor = "#505050";
        };
        DivTab.onmouseout  = function ()
        {
            if (true !== bActive)
                DivTab.style.backgroundColor = "transparent";
            else
                DivTab.style.backgroundColor = "#737373";
        };

        NewTab.onmousedown = function ()
        {
            DivTab.style.backgroundColor = "#969696";
        };

        DivTab.appendChild(NewTab);
        TabPanel.appendChild(DivTab);
    }

    AddMenuItem("http://www.webgoboard.com/index", "Kogo's joseki", sActive === "index");
    AddMenuItem("http://www.webgoboard.com/19", "Board 19x19", sActive === "19");
    AddMenuItem("http://www.webgoboard.com/13", "Board 13x13", sActive === "13");
    AddMenuItem("http://www.webgoboard.com/9", "Board 9x9", sActive === "9");
    AddMenuItem("http://www.webgoboard.com/introduction", "Introduction to Go", sActive === "Intro");
    AddMenuItem("http://www.webgoboard.com/problems", "Problems", sActive === "Problems");
    AddMenuItem("http://www.webgoboard.com/wordpressplugin", "WordPress Plugin", sActive === "WordPress");
}

function LoadMainDiv()
{
    var oDiv = document.createElement("div");
    oDiv.id             = "divId";
    oDiv.style.position = "absolute";
    oDiv.style.left     = "0px";
    oDiv.style.top      = nMenuHeight + "px";
    oDiv.style.width    = "100px";
    oDiv.style.height   = "100px";
    oDiv.tabIndex       = -1;
    oDiv.onfocus        = BodyFocus;

    document.body.appendChild(oDiv);
}

function LoadGameTree()
{
    oGameTree = GoBoardApi.Create_GameTree();
    GoBoardApi.Set_Sound(oGameTree, 'http://webgoboard.com/Sound');
    GoBoardApi.Create_BoardCommentsButtonsNavigator(oGameTree, "divId");
    GoBoardApi.Focus(oGameTree);
    window.onresize();
}

function LoadGameTreePresentation(aSlides)
{
    oGameTree = GoBoardApi.Create_GameTree();
    GoBoardApi.Set_Sound(oGameTree, 'http://webgoboard.com/Sound');
    GoBoardApi.Create_Presentation(oGameTree, "divId", aSlides);
    GoBoardApi.Focus(oGameTree);
    window.onresize();
}

function LoadGameTreeProblems()
{
    oGameTree = GoBoardApi.Create_GameTree();
    GoBoardApi.Set_Sound(oGameTree, 'http://webgoboard.com/Sound');
    GoBoardApi.Create_Problems(oGameTree, "divId", {TutorColor : "Auto", TutorTime : 0.2, NewNode : ""});
    GoBoardApi.Focus(oGameTree);
    window.onresize();
}

function BodyFocus()
{
    if (oGameTree)
        GoBoardApi.Focus(oGameTree);
}

window.onresize = function()
{
    var oMainDiv = document.getElementById("divId");
    if (oMainDiv)
    {
        oMainDiv.style.width = window.innerWidth + "px";
        oMainDiv.style.height = (window.innerHeight - nMenuHeight) + "px";
    }

    var oMenuUl = document.getElementById("menuId");
    if (oMenuUl)
    {
        oMenuUl.style.width = (window.innerWidth - 2) + "px";
    }

    if (oGameTree)
        GoBoardApi.Update_Size(oGameTree);
};

function OnDocumentReady(sActive)
{
    LoadMenu(sActive);
    LoadMainDiv();
    LoadGameTree();
    window.onresize();
}

function OnDocumentReadyPresentation(aSlides)
{
    LoadMenu("Intro");
    LoadMainDiv();
    LoadGameTreePresentation(aSlides);
    window.onresize();
}

function OnDocumentReadyProblems()
{
    LoadMenu("Problems");
    LoadMainDiv();
    LoadGameTreeProblems();
    window.onresize();
}

function OnDocumentReadyWPPlugin()
{
    LoadMenu("WordPress");
}

function Decode_Base64_UrlSafe(sInput)
{
    sInput = sInput.replace(new RegExp("~", 'g'), '+');
    sInput = sInput.replace(new RegExp("-", 'g'), '/');
    sInput = sInput.replace(new RegExp("_", 'g'), '=');
    return atob(sInput);
}

function Decode_UTF8(sUtf8Text)
{
    var sString = "";
    var nPos = 0;
    var nCharCode1 = 0, nCharCode2 = 0, nCharCode3 = 0;

    var nLen = sUtf8Text.length;
    while (nPos < nLen)
    {
        nCharCode1 = sUtf8Text.charCodeAt(nPos);

        if (nCharCode1 < 128)
        {
            sString += String.fromCharCode(nCharCode1);
            nPos++;
        }
        else if((nCharCode1 > 191) && (nCharCode1 < 224))
        {
            nCharCode2 = sUtf8Text.charCodeAt(nPos + 1);
            sString += String.fromCharCode(((nCharCode1 & 31) << 6) | (nCharCode2 & 63));
            nPos += 2;
        }
        else
        {
            nCharCode2 = sUtf8Text.charCodeAt(nPos + 1);
            nCharCode3 = sUtf8Text.charCodeAt(nPos + 2);
            sString += String.fromCharCode(((nCharCode1 & 15) << 12) | ((nCharCode2 & 63) << 6) | (nCharCode3 & 63));
            nPos += 3;
        }
    }

    return sString;
}
