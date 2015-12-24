"use strict";

/**
 * Copyright 2015 the HtmlGoBoard project authors.
 * All rights reserved.
 * Project  WebSDK
 * Author   Ilya Kirillov
 * Date     26.06.15
 * Time     23:10
 */
var oGameTree = null;

function LoadMenu()
{
    var oMenu = document.createElement("ul");
    oMenu.className = "topmenu";
    oMenu.id        = "menuId";

    function AddMenuItem(oMenu, sLink, sTitle)
    {
        var oHref = document.createElement("a");
        oHref.href = sLink;
        oHref.title = sTitle;
        oHref.innerHTML = sTitle;

        var oLi = document.createElement("li");
        oLi.appendChild(oHref);
        oMenu.appendChild(oLi);
    }

    AddMenuItem(oMenu, "http://www.webgoboard.com/index", "Kogo's joseki");
    AddMenuItem(oMenu, "http://www.webgoboard.com/19", "Board 19x19");
    AddMenuItem(oMenu, "http://www.webgoboard.com/13", "Board 13x13");
    AddMenuItem(oMenu, "http://www.webgoboard.com/9", "Board 9x9");
    AddMenuItem(oMenu, "http://www.webgoboard.com/introduction", "Introduction to Go");
    AddMenuItem(oMenu, "http://www.webgoboard.com/problems", "Problems");

    document.body.appendChild(oMenu);
}

function LoadMainDiv()
{
    var oDiv = document.createElement("div");
    oDiv.id             = "divId";
    oDiv.style.position = "absolute";
    oDiv.style.left     = "0px";
    oDiv.style.top      = "35px";
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
        oMainDiv.style.height = (window.innerHeight - 35) + "px";
    }

    var oMenuUl = document.getElementById("menuId");
    if (oMenuUl)
    {
        oMenuUl.style.width = (window.innerWidth - 2) + "px";
    }

    if (oGameTree)
        GoBoardApi.Update_Size(oGameTree);
};

function OnDocumentReady()
{
    LoadMenu();
    LoadMainDiv();
    LoadGameTree();
    window.onresize();
}

function OnDocumentReadyPresentation(aSlides)
{
    LoadMenu();
    LoadMainDiv();
    LoadGameTreePresentation(aSlides);
    window.onresize();
}

function OnDocumentReadyProblems()
{
    LoadMenu();
    LoadMainDiv();
    LoadGameTreeProblems();
    window.onresize();
}
