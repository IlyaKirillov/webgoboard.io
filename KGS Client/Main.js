"use strict";
/**
 * User: Ilja.Kirillov
 * Date: 17.05.2016
 * Time: 12:48
 */

window.onload         = OnDocumentReady;
window.onbeforeunload = OnDocumentClose;

var oClient     = new CKGSClient();

var oBody = null;
var PlayersListControl = null;
var PlayersListView    = new CListView();
PlayersListView.Set_BGColor(243, 243, 243);

var GamesListControl   = null;
var GamesListView      = new CListView();
GamesListView.Set_BGColor(243, 243, 243);

var PanelTabs = [];
var CurrentTab = null;

function Connect()
{
    var sLogin    = document.getElementById("inputLoginId").value;
    var sPassword = document.getElementById("inputPasswordId").value;
    document.getElementById("inputPasswordId").value = "";
    oClient.Connect(sLogin, sPassword, "en_US");

    document.getElementById("divIdClientNameText").innerHTML = sLogin;

    var oDiv = document.getElementById("divIdConnection");
    $(oDiv).fadeOut(200);
}

function OnConnect()
{
    var oDiv = document.getElementById("divMainId");
    $(oDiv).fadeIn(200);
    window.onresize();
}

function RemoveCreatePanel()
{
    var Panel = document.getElementById("divIdCreatePanel");
    $(Panel).fadeOut(0);
}

function CollapseCreatePanel()
{
    var Panel = document.getElementById("divIdCreatePanel");
    Panel.style.top     = "30px";
    Panel.style.opacity = "0";

    Panel.addEventListener("transitionend", RemoveCreatePanel, false);
}

function OpenCreatePanel()
{
    var Panel = document.getElementById("divIdCreatePanel");
    Panel.removeEventListener("transitionend", RemoveCreatePanel);
    $(Panel).fadeIn(0);
    Panel.style.top     = "50px";
    Panel.style.opacity = "1";
}

function OnDocumentReady()
{
    document.getElementById("inputLoginId").onkeypress    = function(e)
    {
        var event    = e || window.event;
        var charCode = event.which || event.keyCode;
        if (13 === charCode)
        {
            document.getElementById("inputPasswordId").focus();
            return false;
        }
    };
    document.getElementById("inputPasswordId").onkeypress = function(e)
    {
        var event    = e || window.event;
        var charCode = event.which || event.keyCode;
        if (13 === charCode)
        {
            Connect();
            return false;
        }
    };
    document.getElementById("connectDivId").onkeypress = function(e)
    {
        var event    = e || window.event;
        var charCode = event.which || event.keyCode;
        if (13 === charCode)
        {
            Connect();
            return false;
        }
    };

    document.getElementById("connectDivId").onmouseup    = Connect;
    document.getElementById("divMainId").onclick         = CollapseCreatePanel;
    document.getElementById("divIdCreateButton").onclick = function(e)
    {
        var Panel = document.getElementById("divIdCreatePanel");
        if (1 == Panel.style.opacity)
            CollapseCreatePanel();
        else
            OpenCreatePanel();

        if (event && event.stopPropagation())
            event.stopPropagation();
    };

    //------------------------------------------------------------------------------------------------------------------
    // Exit button
    //------------------------------------------------------------------------------------------------------------------
    var oDivExtButtton         = document.getElementById("divIdExitButton");
    oDivExtButtton.onmouseover = function()
    {
        oDivExtButtton.style.backgroundColor = "#505050";
    };
    oDivExtButtton.onmouseout  = function()
    {
        oDivExtButtton.style.backgroundColor = "transparent";
    };
    oDivExtButtton.onclick     = function()
    {
        if (oClient)
        {
            oClient.Disconnect();
            document.getElementById("divMainId").style.display       = "none";
            document.getElementById("divIdConnection").style.display = "block";

            GamesListView.Clear();
            PlayersListView.Clear();
        }
    };
    oDivExtButtton.onmousedown = function()
    {
        oDivExtButtton.style.backgroundColor = "#969696";
    };
    //------------------------------------------------------------------------------------------------------------------
    // Расположим начальное окно с коннектом посередине
    //------------------------------------------------------------------------------------------------------------------
    var ConnectionDiv        = document.getElementById("divIdConnection");
    ConnectionDiv.style.left = (document.body.clientWidth - 250) / 2 + "px";
    ConnectionDiv.style.top  = (document.body.clientHeight - 100) / 2 + "px";
    //------------------------------------------------------------------------------------------------------------------
    function AddGreetingMessage()
    {
        var oDiv     = document.getElementById("textareaChatId");
        var oTextDiv = document.createElement("div");

        oTextDiv.style.textAlign   = "center";
        var oTextSpan              = document.createElement("span");
        oTextSpan.style.fontWeight = "bold";
        oTextSpan.textContent      = "Welcome to Kiseido Go Server!";


        oTextDiv.appendChild(oTextSpan);
        oDiv.appendChild(oTextDiv);

        oDiv.scrollTop = oDiv.scrollHeight;
    }

    AddGreetingMessage();

    var MainDiv    = document.getElementById("divIdMainRoom");
    var MainDivTab = document.getElementById("divIdMainRoomTab");

    PanelTabs = [];
    PanelTabs.push({Div : MainDiv, Id : -1, TabDiv : MainDivTab});
    CurrentTab = PanelTabs[0];

    MainDivTab.onmousemove   = function()
    {
        MainDivTab.style.backgroundColor = "#009983";
    };
    MainDivTab.onmousedown   = function()
    {
        MainDivTab.style.backgroundColor = "#008272";
        MainDivTab.style.border          = "1px solid black";
    };
    MainDivTab.onmouseout    = function()
    {
        MainDivTab.style.backgroundColor = "#008272";
        MainDivTab.style.border          = "1px solid transparent";
    };
    MainDivTab.onmouseup     = function()
    {
        MainDivTab.style.border = "1px solid transparent";
        OnPanelTabClick(MainDiv);
    };
    MainDivTab.onselectstart = function()
    {
        return false;
    };

    window.onresize = function()
    {
        if ("none" !== document.getElementById("divIdConnection").style.display)
        {
            // Расположим начальное окно с коннектом посередине
            var ConnectionDiv = document.getElementById("divIdConnection");
            ConnectionDiv.style.left = (document.body.clientWidth - 250) / 2 + "px";
            ConnectionDiv.style.top  = (document.body.clientHeight - 100) / 2 + "px";
        }

        if (oBody)
        {
            var W = oBody.HtmlElement.clientWidth;
            var H = oBody.HtmlElement.clientHeight;
            oBody.Resize(W, H);
            PlayersListView.Update();
            PlayersListView.Update_Size();

            GamesListView.Update();
            GamesListView.Update_Size();

            for (var Pos in PanelTabs)
            {
                var Tab = PanelTabs[Pos];
                if (Tab.Div.style.display === "block" && Tab.GameTree)
                    GoBoardApi.Update_Size(Tab.GameTree);
            }
        }
    };

    document.getElementById("inputChatId").onkeydown = SendChatMessage;


    // Основная Div
    oBody = CreateControlContainer("divMainId");
    oBody.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, -1);
    oBody.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);

    // Панель табов
    var oTabPanelControl = CreateControlContainer("divIdTabPanel");
    oTabPanelControl.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, 50);
    oTabPanelControl.Anchor = (g_anchor_top |g_anchor_left | g_anchor_right);
    oBody.AddControl(oTabPanelControl);

    var TabPanelDiv = oTabPanelControl.HtmlElement;
    TabPanelDiv.style.fontSize        = "12px";
    TabPanelDiv.style.backgroundColor = "#050708";
    TabPanelDiv.style.fontFamily      = '"Segoe UI",Helvetica,Tahoma,Geneva,Verdana,sans-serif';
    TabPanelDiv.style.cursor          = "default";
    TabPanelDiv.style["-webkit-font-smoothing"] = "antialiased";

    // Основная комната
    var oMainRoomControl = CreateControlContainer("divIdMainRoom");
    oMainRoomControl.Bounds.SetParams(0, 50, 1000, 1000, false, true, false, false, -1, -1);
    oMainRoomControl.Anchor = (g_anchor_bottom |g_anchor_left | g_anchor_right);
    oBody.AddControl(oMainRoomControl);

    // Список игроков
    PlayersListControl = PlayersListView.Init("divPlayersListId", g_oPlayersList);
    var oPlayersListDiv = PlayersListControl;
    oPlayersListDiv.Bounds.SetParams(0, 0, 0, 1000, false, false, true, false, 300, -1);
    oPlayersListDiv.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right);
    oPlayersListDiv.HtmlElement.style.background = "#F3F3F3";
    oMainRoomControl.AddControl(oPlayersListDiv);

    // Левая часть
    var oLeftPartControl = CreateControlContainer("divIdL");
    oLeftPartControl.Bounds.SetParams(0, 0, 300, 1000, false, false, true, false, -1, -1);
    oLeftPartControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
    oMainRoomControl.AddControl(oLeftPartControl);

    // Часть под чат
    var oChatControl = CreateControlContainer("divIdLChat");
    oChatControl.Bounds.SetParams(0, 500, 1000, 1000, false, false, false, false, -1, -1);
    oChatControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
    oLeftPartControl.AddControl(oChatControl);

    // Все сообщения
    var oChatTextAreaControl = CreateControlContainer("divIdLChatTextArea");
    oChatTextAreaControl.Bounds.SetParams(0, 0, 2, 52, true, false, true, true, -1, -1);
    oChatTextAreaControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
    oChatControl.AddControl(oChatTextAreaControl);

    // Место для набора
    var oChatInputControl = CreateControlContainer("divIdLChatInput");
    oChatInputControl.Bounds.SetParams(0, 0, 2, 1, true, false, true, true, -1, 50);
    oChatInputControl.Anchor = (g_anchor_bottom | g_anchor_right | g_anchor_left);
    oChatControl.AddControl(oChatInputControl);

    // Список игровых комнат
    var oGamesListWrapperControl = CreateControlContainer("divIdLGamesWrapper");
    oGamesListWrapperControl.Bounds.SetParams(0, 0, 1000, 500, false, false, false, false, -1, -1);
    oGamesListWrapperControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
    oLeftPartControl.AddControl(oGamesListWrapperControl);

    GamesListControl = GamesListView.Init("divIdLGames", g_oGamesList);
    GamesListControl.Bounds.SetParams(0, 0, 2, 1, true, false, true, true, -1, -1);
    GamesListControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
    GamesListControl.HtmlElement.style.background = "#F3F3F3";
    oGamesListWrapperControl.AddControl(GamesListControl);

    document.getElementById("divMainId").style.display       = "none";
    document.getElementById("divIdConnection").style.display = "block";

    window.onresize();

}

function OnDocumentClose()
{
    if (!oClient)
        return;

    oClient.Disconnect();
}

function EnterGameRoom(GameRoomId)
{
    // Проверим, находимся ли мы уже в данной комнате
    for (var TabPos in PanelTabs)
    {
        if (PanelTabs[TabPos].Id === GameRoomId)
        {
            OnPanelTabClick(PanelTabs[TabPos].Div);
            return;
        }
    }

    if (!oClient)
        return;

    oClient.ConnectToGameRoom(GameRoomId);
}

function LeaveGameRoom(GameRoomId)
{
    if (!oClient)
        return;

    oClient.LeaveGameRoom(GameRoomId);
}

function OnAddChatMessage(UserName, Text)
{
    var oDiv     = document.getElementById("textareaChatId");
    var oTextDiv = document.createElement("div");

    var oTextSpan              = document.createElement("span");
    oTextSpan.style.fontWeight = "bold";
    oTextSpan.textContent      = UserName + ": ";
    oTextDiv.appendChild(oTextSpan);

    oTextSpan                  = document.createElement("span");
    oTextSpan.textContent      = Text;
    oTextDiv.appendChild(oTextSpan);

    oDiv.appendChild(oTextDiv);

    oDiv.scrollTop = oDiv.scrollHeight;
}

function OnLogout(sText)
{
    if (sText)
    {
        alert(sText);
    }

    document.getElementById("divMainId").style.display       = "none";
    document.getElementById("divIdConnection").style.display = "block";

    GamesListView.Clear();
    PlayersListView.Clear();
}

function SendChatMessage(e)
{
    var oInputArea = document.getElementById("inputChatId");
    if (13 === e.keyCode && true !== e.ctrlKey && true !== e.shiftKey && oClient)
    {
        oClient.SendChatMessage(oInputArea.value);
        oInputArea.value = "";
        e.preventDefault();
    }
}


function EnterGameRoom2(GameRoomId, SGF, ManagerId, sTabName)
{
    var DivId = "divMainId" + GameRoomId;

    var GameRoom = {};
    GameRoom.Id = GameRoomId;

    var GameRoomDiv = document.createElement("div");
    GameRoomDiv.style.position = "absolute";
    GameRoomDiv.id  = DivId;
    GameRoom.Div = GameRoomDiv;

    var MainDiv = document.getElementById("divMainId");
    MainDiv.appendChild(GameRoomDiv);

    var GameRoomControl = CreateControlContainer(DivId);
    GameRoomControl.Bounds.SetParams(0, 50, 1000, 1000, false, true, false, false, -1, -1);
    GameRoomControl.Anchor = (g_anchor_bottom |g_anchor_left | g_anchor_right);
    oBody.AddControl(GameRoomControl);

    var BoardDiv = document.createElement("div");
    BoardDiv.id = DivId + "B";
    GameRoomDiv.appendChild(BoardDiv);

    var GameRoomBoardControl = CreateControlContainer(DivId + "B");
    GameRoomBoardControl.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, -1);
    GameRoomBoardControl.Anchor = (g_anchor_top | g_anchor_bottom |g_anchor_left | g_anchor_right);
    GameRoomControl.AddControl(GameRoomBoardControl);

    var oGameTree = GoBoardApi.Create_GameTree();
    GoBoardApi.Create_BoardWithNavigateButtons(oGameTree, DivId + "B");
    if (SGF)
        GoBoardApi.Load_Sgf(oGameTree, SGF);

    GoBoardApi.Update_Size(oGameTree);
    GameRoom.GameTree = oGameTree;

    GameRoom.ManagerId  = ManagerId;

    window.onresize();

    PanelTabs.push(GameRoom);

    var TabPanel = document.getElementById("divIdTabPanelRooms");

    var DivTab = document.createElement("div");
    DivTab.style.transitionProperty = "width,height,background,margin,border,padding";
    DivTab.style.transitionDuration = ".25s";

    DivTab.style.float              = "left";
    DivTab.style.height             = "100%";
    DivTab.style.margin             = "0px";
    DivTab.style.padding            = "0px";

    var NewTab =  document.createElement("button");
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

    NewTab.style.fontSize           = "14px";
    NewTab.style.height             = "100%";
    NewTab.style.margin             = "0px";
    NewTab.style.padding            = "0px 0px 0px 14px";
    NewTab.style.color              = "#fff";
    NewTab.style.maxWidth           = "100px";
    NewTab.style.overflow           = "hidden";

    NewTab.style.float              = "left";

    var NewTabDiv = document.createElement("div");
    NewTabDiv.innerHTML = sTabName;//"Room " + GameRoomId;
    NewTabDiv.onselectstart = function(){return false;};
    NewTab.appendChild(NewTabDiv);

    DivTab.onmouseover = function()
    {
        DivTab.style.backgroundColor = "#505050";
    };
    DivTab.onmouseout = function()
    {
        if (CurrentTab.TabDiv !== DivTab)
            DivTab.style.backgroundColor = "transparent";
        else
            DivTab.style.backgroundColor = "#737373";
    };

    NewTab.onclick = function()
    {
        OnPanelTabClick(GameRoomDiv);
    };
    NewTab.onmousedown = function()
    {
        DivTab.style.backgroundColor = "#969696";
    };

    DivTab.appendChild(NewTab)

    var CloseButton = document.createElement("button");
    CloseButton.tabIndex = "0";
    CloseButton["aria-label"] = "Close room " + GameRoomId;
    CloseButton.title         = "Close room " + GameRoomId;

    CloseButton.style.fontFamily                = '"Segoe UI",Helvetica,Tahoma,Geneva,Verdana,sans-serif';
    CloseButton.style["-webkit-font-smoothing"] = "antialiased";
    CloseButton.style.padding                   = "0px";
    CloseButton.style.border                    = "1px solid transparent";
    CloseButton.style.boxSizing                 = "border-box";
    CloseButton.style["-moz-box-sizing"]        = "border-box";
    CloseButton.style.background                = "none";
    CloseButton.style.outline                   = "none";
    CloseButton.style.cursor                    = "pointer";
    CloseButton.style["-webkit-appearance"]     = "none";
    CloseButton.style["-webkit-border-radius"]  = "0";
    CloseButton.style.overflow                  = "visible";
    CloseButton.style.color                     = "#fff";

    CloseButton.style.float    = "left";
    CloseButton.style.height   = "100%";
    CloseButton.style.width    = "40px";

    CloseButton.style.transitionProperty = "color";
    CloseButton.style.transitionDuration = ".25s";


    CloseButton.onmousedown = function()
    {
        CloseButton.style.color = "#008272";
    };
    CloseButton.onmouseout = function()
    {
        CloseButton.style.color = "#fff";
    };
    CloseButton.onmouseover = function()
    {
        CloseButton.style.color = "#009983";
    };


    var CBCenter = document.createElement("center");
    var CBCDiv   = document.createElement("div");
    CBCDiv.style.fontSize   = "12px";
    CBCDiv.style.lineHeight = "16px";
    CBCDiv.style.width      = "12px";
    CBCDiv.style.height     = "16px";
    CBCDiv.style.position   = "relative";
    var CBCDSpan = document.createElement("span");

    CBCDSpan.style.position = "absolute";
    CBCDSpan.style.width    = "100%";
    CBCDSpan.style.height   = "100%";
    CBCDSpan.style.left     = "0px";
    CBCDSpan.style.top      = "2px";

    CBCDSpan.className += " " + "closeSpan";

    CBCDiv.appendChild(CBCDSpan);
    CBCenter.appendChild(CBCDiv);
    CloseButton.appendChild(CBCenter);
    DivTab.appendChild(CloseButton);

    CloseButton.onclick = function()
    {
        LeaveGameRoom(GameRoomId);
        OnRemoveTab(GameRoomDiv);
        TabPanel.removeChild(DivTab);
    };

    TabPanel.appendChild(DivTab);
    GameRoom.TabDiv = DivTab;

    OnPanelTabClick(GameRoomDiv);
}

function OnPanelTabClick(Div)
{
    var CurTab = CurrentTab;
    var NewTab = null;

    for (var Pos in PanelTabs)
    {
        var Tab = PanelTabs[Pos];
        if (Div !== Tab.Div)
        {
        }
        else
        {
            NewTab = Tab;
            break;
        }
    }

    if (!NewTab || NewTab === CurTab)
        return;

    $(CurTab.Div).fadeOut(500);
    $(NewTab.Div).fadeIn(500);

    if (CurTab.GameTree)
    {
        CurTab.TabDiv.style.backgroundColor = "transparent";
    }

    if (NewTab.GameTree)
    {
        NewTab.TabDiv.style.backgroundColor = "#737373";
    }
    CurrentTab = NewTab;

    if (NewTab.GameTree)
        GoBoardApi.Update_Size(NewTab.GameTree);
}

function OnRemoveTab(Div)
{
    for (var Pos in PanelTabs)
    {
        var Tab = PanelTabs[Pos];
        if (Div === Tab.Div)
        {
            try
            {
                document.getElementById("divMainId").removeChild(Tab.Div);
                document.getElementById("divIdTabPanel").removeChild(Tab.TabDiv);
            }
            catch (e)
            {}
            PanelTabs.splice(Pos, 1);
            OnPanelTabClick(PanelTabs[0].Div);
            break;
        }
    }
}

function GetTabByRoomId(RoomId)
{
    for (var Pos = 0, Count = PanelTabs.length; Pos < Count; ++Pos)
    {
        if (PanelTabs[Pos].Id === RoomId)
            return PanelTabs[Pos];
    }

    return null;
}


function CKGSClient()
{
    this.isLoggedIn = false;

    this.nCurrentChannelId = -1;

    this.m_aGames      = {};
    this.m_aFriends    = [];
    this.m_aRooms      = {};
}
CKGSClient.prototype.Connect = function(sLogin, sPassword, sLocale)
{
    this.private_SendMessage({
        "type"     : "LOGIN",
        "name"     : sLogin,
        "password" : sPassword,
        "locale"   : sLocale ? sLocale : "en-US"
    });
};
CKGSClient.prototype.ConnectAsGuest = function()
{

};
CKGSClient.prototype.Disconnect = function()
{
    this.private_SendMessage({
            "type" : "LOGOUT"
    });
};
CKGSClient.prototype.ConnectToGameRoom = function(nGameRoomId)
{
    this.private_SendMessage({
        "type"      : "JOIN_REQUEST",
        "channelId" : nGameRoomId
    });
};
CKGSClient.prototype.LeaveGameRoom = function(nGameRoomId)
{
    this.private_SendMessage({
        "type"      : "UNJOIN_REQUEST",
        "channelId" : nGameRoomId
    });
};
CKGSClient.prototype.SendChatMessage = function(sText)
{
    this.private_SendMessage({
        "type"      : "CHAT",
        "channelId" : this.nCurrentChannelId,
        "text"      : sText
    });
};
CKGSClient.prototype.LoadUserInfo = function(sUserName)
{
    this.private_SendMessage({
        "type" : "DETAILS_JOIN_REQUEST",
        "name" : sUserName
    });
};
CKGSClient.prototype.private_SendMessage = function(oMessage)
{
    var oThis = this;
    var req = new XMLHttpRequest();
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status == 200)
            {
                console.log("Upload success: type = " + oMessage.type);
                if (oMessage.type == "LOGIN")
                {
                    // After our login message has been sent, we kick off the first download operation to see the result.
                    // After this first download call, each download will automatically trigger the next,
                    // so we won't need to call this again.
                    oThis.isLoggedIn = true;
                    oThis.private_RecieveMessage();
                }
            }
            else
            {
                // Upload failed. We'll just report it to the user. This is to help debugging, in a finished client you would
                // want to hide this.
                // The responseText is a big error page from your JSP system, but all KGS error messages have the format
                // ":KGS: error text :KGS:", which makes it easy to extract that with a regex. If the error is in that format,
                // we extract the error; otherwise we show the whole report.
                var errorText = req.responseText;
                var matcher = /:KGS: (.*?) :KGS:/.exec(errorText);
                if (matcher) {
                    errorText = matcher[1];
                }
                console.log("Error : " + errorText);
            }
        }
    };
    req.open("POST", "http://metakgs.org/api/access", true);
    req.send(JSON.stringify(oMessage));
};
CKGSClient.prototype.private_RecieveMessage = function()
{
    var oThis = this;
    var req = new XMLHttpRequest();
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status == 200)
            {
                // We have a valid response! Turn it into a javascript object.
                var response = JSON.parse(req.responseText);
                if (response.messages)
                {
                    // After 1 minute with no message, we'll time out and get an "empty" response. We only want to do the
                    // forEach here if the response has content.
                    for (var nIndex = 0, nCount = response.messages.length; nIndex < nCount; ++nIndex)
                    {
                        oThis.private_HandleMessage(response.messages[nIndex]);
                    }
                }

                if (oThis.isLoggedIn)
                {
                    oThis.private_RecieveMessage();
                }
            }
            else
            {
                console.log("Download failure: Status = " + req.status + ", response text = " + req.responseText);
                oThis.isLoggedIn = false;
            }
        }
    };
    req.open("GET", "http://metakgs.org/api/access", true);
    req.send();
};
CKGSClient.prototype.private_HandleMessage = function(oMessage)
{
    //console.log("Download success: type = " + oMessage.type);
    //console.log(oMessage);
    if (oMessage.type == "LOGOUT")
    {
        this.private_HandleLogout(oMessage);
    }
    else if ("LOGIN_SUCCESS" === oMessage.type)
    {
        this.private_HandleLoginSuccess(oMessage);
    }
    else if ("ROOM_NAMES" === oMessage.type)
    {
        this.private_HandleRoomNames(oMessage);
    }
    else if ("ROOM_JOIN" === oMessage.type)
    {
        this.private_HandleRoomJoin(oMessage);
    }
    else if ("GAME_JOIN" === oMessage.type)
    {
        this.private_HandleGameJoin(oMessage);
    }
    else if ("GAME_UPDATE" === oMessage.type)
    {
        this.private_HandleGameUpdate(oMessage);
    }
    else if ("CHAT" === oMessage.type)
    {
        this.private_HandleChat(oMessage);
    }
    else if ("USER_ADDED" === oMessage.type)
    {
        this.private_HandleUserAdded(oMessage);
    }
    else if ("USER_REMOVED" === oMessage.type)
    {
        this.private_HandleUserRemoved(oMessage);
    }
    else if ("GAME_CONTAINER_REMOVE_GAME" === oMessage.type)
    {
        this.private_HandleGameContainerRemoveGame(oMessage);
    }
    else if ("GAME_LIST" === oMessage.type)
    {
        this.private_HandleGameList(oMessage);
    }
};
CKGSClient.prototype.private_HandleLogout = function(oMessage)
{
    this.isLoggedIn = false;
    OnLogout(oMessage.text);
};
CKGSClient.prototype.private_HandleRoomNames = function(oMessage)
{
    if (!oMessage.rooms || oMessage.rooms.length <= 0)
        return;

    for (var nIndex = 0, nCount = oMessage.rooms.length; nIndex < nCount; ++nIndex)
    {
        var nChannelId = oMessage.rooms[nIndex].channelId;
        var sName      = oMessage.rooms[nIndex].name;

        this.m_aRooms[nChannelId] =
        {
            ChannelId : nChannelId,
            Name      : sName
        };

        if ("English Game Room" === sName)
            this.nCurrentChannelId = nChannelId;
    }
};
CKGSClient.prototype.private_HandleRoomJoin = function(oMessage)
{
    var Games = oMessage.games;
    if (Games && Games.length > 0)
    {
        for (var Pos = 0, Count = Games.length; Pos < Count; ++Pos)
        {
            var oEntry = Games[Pos];
            this.private_HandleGameRecord(oEntry, true);
        }
        GamesListView.Update_Size();
        GamesListView.Update();
    }

    if (oMessage.channelId !== this.nCurrentChannelId)
        return;

    var Users = oMessage.users;
    if (Users && Users.length > 0)
    {
        for (var Pos = 0, Count = oMessage.users.length; Pos < Count; ++Pos)
        {
            var oEntry = Users[Pos];
            this.private_HandleUserRecord(oEntry, true);
        }

        PlayersListView.Update_Size();
        PlayersListView.Update();
    }
};
CKGSClient.prototype.private_HandleLoginSuccess = function(oMessage)
{
    OnConnect();
    var Friends = oMessage.friends;
    if (!Friends)
        return;

    for (var Pos = 0, Count = Friends.length; Pos < Count; ++Pos)
    {
        this.m_aFriends[Friends[Pos].user.name] = 1;
    }
};
CKGSClient.prototype.private_HandleGameRecord = function(oGameRecord, bAdd)
{
    if ("challenge" === oGameRecord.gameType)
        return;

    var nGameId     = oGameRecord.channelId;
    var sGameType   = "";
    var nMoveNumber = oGameRecord.moveNum;
    var nObservers  = undefined !== oGameRecord.observers ? oGameRecord.observers : 0;
    var sComment    = oGameRecord.score ? oGameRecord.score : "";
    var nAdd        = true === bAdd ? 0 : 1;
    var sBlack      = oGameRecord.players.black ? oGameRecord.players.black.name : "";
    var nBlackR     = oGameRecord.players.black ? this.private_GetRank(oGameRecord.players.black.rank) : -3;
    var sWhite      = oGameRecord.players.white ? oGameRecord.players.white.name : "";
    var nWhiteR     = oGameRecord.players.white ? this.private_GetRank(oGameRecord.players.white.rank) : -3;
    var bPrivate    = true === oGameRecord.private ? true : false;
    var sPlace      = (undefined !== this.m_aRooms[oGameRecord.roomId] ? this.m_aRooms[oGameRecord.roomId].Name : "Global");

    if ("demonstration" === oGameRecord.gameType)
    {
        sGameType = "D";
        sComment = "Demonstration by " + oGameRecord.players.owner.name;
    }
    else if ("review" === oGameRecord.gameType || "rengo_review" === oGameRecord.gameType)
    {
        sGameType = "D";
        sComment = "Review by " + oGameRecord.players.owner.name;
    }
    else if ("free" === oGameRecord.gameType)
        sGameType = "F";
    else if ("ranked" === oGameRecord.gameType)
        sGameType = "R";
    else if ("teaching" === oGameRecord.gameType)
        sGameType = "T";
    else if ("simul" === oGameRecord.gameType)
        sGameType = "S";
    else if ("rengo" === oGameRecord.gameType)
        sGameType = "2";
    else if ("tournament" === oGameRecord.gameType)
        sGameType = "*";

    GamesListView.Handle_Record([nAdd, nGameId, sGameType, nObservers, "", sWhite, nWhiteR, "", sBlack, nBlackR, sComment, nMoveNumber, bPrivate, sPlace]);
};
CKGSClient.prototype.private_HandleUserRecord = function(oUserRecord, bAdd)
{
    var sName = oUserRecord.name;
    var nRank = this.private_GetRank(oUserRecord.rank);
    var nAdd  = (false === bAdd ? 1 : 0);
    var bFriend = this.private_IsFriend(sName);
    
    PlayersListView.Handle_Record([nAdd, sName, nRank, bFriend]);
};
CKGSClient.prototype.private_HandleGameJoin = function(oMessage)
{
    //console.log(oMessage);

    var GameRoomId = oMessage.channelId;
    var oGame =
        {
            GameRoomId : GameRoomId,
            GameTree   : null,
            Nodes      : {},
            CurNode    : null
        };

    this.m_aGames[GameRoomId] = oGame;

    var nSize      = oMessage.gameSummary.size | 0;
    var sBlackName = oMessage.gameSummary.players.black.name;
    var sBlackRank = oMessage.gameSummary.players.black.rank;
    var sWhiteName = oMessage.gameSummary.players.white.name;
    var sWhiteRank = oMessage.gameSummary.players.white.rank;

    var sSGF = "(;FF[4]";
    sSGF += "SZ[" + nSize + "]";
    sSGF += "PB[" + sBlackName + "]";
    sSGF += "PW[" + sWhiteName + "]";
    sSGF += "WR[" + sWhiteRank + "]";
    sSGF += "BR[" + sBlackRank + "]";
    sSGF += ")";

    EnterGameRoom2(GameRoomId, sSGF, null, sWhiteName + " vs. " + sBlackName);

    var oTab = GetTabByRoomId(GameRoomId);
    if (!oTab)
        return;

    var oGameTree = oTab.GameTree;

    var oCurNode = oGameTree.Get_CurNode();
    oGame.Nodes[0] =
    {
        Node   : oCurNode,
        NodeId : 0
    };

    var sgfEvents = oMessage.sgfEvents;
    for (var nIndex = 0, nCount = sgfEvents.length; nIndex < nCount; ++nIndex)
    {
        var sgfEvent = sgfEvents[nIndex];

        if ("PROP_GROUP_ADDED" === sgfEvent.type)
        {
            var oProps = sgfEvent.props;
            for (var nPropsIndex = 0, nPropsCount = oProps.length; nPropsIndex < nPropsCount; ++nPropsIndex)
            {
                private_ReadProp(oProps[nPropsIndex]);
            }
        }
        else if ("PROP_ADDED" === sgfEvent.type)
        {
            private_ReadProp(sgfEvent.prop);
        }
        else if ("CHILD_ADDED" === sgfEvent.type)
        {
            var oNewNode = new CNode(oGameTree);
            oCurNode.Add_Next(oNewNode, true);
            oCurNode = oNewNode;
            oGame.Nodes[sgfEvent.childNodeId] =
            {
                Node   : oNewNode,
                NodeId : sgfEvent.childNodeId
            };
        }
        else if ("ACTIVATED" === sgfEvent.type)
        {
            if (oGame.Nodes[sgfEvent.nodeId])
                oCurNode = oGame.Nodes[sgfEvent.nodeId].Node;
        }
    }

    function private_ReadProp(oProp)
    {
        if ("MOVE" === oProp.name)
        {
            var nX = oProp.loc.x;
            var nY = oProp.loc.y;
            var nColor = "black" === oProp.color ? BOARD_BLACK : BOARD_WHITE;
            oCurNode.Add_Move(nX + 1, nY + 1, nColor);
        }
    }

    oGameTree.GoTo_Node(oCurNode);

    oGame.GameTree = oGameTree;
    oGame.CurNode  = oCurNode;

    if (oGameTree.m_oDrawingNavigator)
    {
        oGameTree.m_oDrawingNavigator.Create_FromGameTree();
        oGameTree.m_oDrawingNavigator.Update();
    }
};
CKGSClient.prototype.private_HandleGameUpdate = function(oMessage)
{
    //console.log(oMessage);
    var GameRoomId = oMessage.channelId;
    var oGame = this.m_aGames[GameRoomId];
    var oGameTree = oGame.GameTree;

    var oCurNode = oGame.CurNode;

    var bGoToNode = oCurNode === oGameTree.Get_CurNode();

    var sgfEvents = oMessage.sgfEvents;
    for (var nIndex = 0, nCount = sgfEvents.length; nIndex < nCount; ++nIndex)
    {
        var sgfEvent = sgfEvents[nIndex];

        if ("PROP_GROUP_ADDED" === sgfEvent.type)
        {
            var oProps = sgfEvent.props;
            for (var nPropsIndex = 0, nPropsCount = oProps.length; nPropsIndex < nPropsCount; ++nPropsIndex)
            {
                private_ReadProp(oProps[nPropsIndex]);
            }
        }
        else if ("PROP_ADDED" === sgfEvent.type)
        {
            private_ReadProp(sgfEvent.prop);
        }
        else if ("CHILD_ADDED" === sgfEvent.type)
        {
            var oNewNode = new CNode(oGameTree);
            oCurNode.Add_Next(oNewNode, true);
            oCurNode = oNewNode;
            oGame.Nodes[sgfEvent.childNodeId] =
            {
                Node   : oNewNode,
                NodeId : sgfEvent.childNodeId
            };
        }
        else if ("ACTIVATED" === sgfEvent.type)
        {
            if (oGame.Nodes[sgfEvent.nodeId])
                oCurNode = oGame.Nodes[sgfEvent.nodeId].Node;
        }
    }

    function private_ReadProp(oProp)
    {
        if ("MOVE" === oProp.name)
        {
            var nX = oProp.loc.x;
            var nY = oProp.loc.y;
            var nColor = "black" === oProp.color ? BOARD_BLACK : BOARD_WHITE;
            oCurNode.Add_Move(nX + 1, nY + 1, nColor);
        }
    }

    if (bGoToNode)
        oGameTree.GoTo_Node(oCurNode);

    oGame.CurNode  = oCurNode;

    if (oGameTree.m_oDrawingNavigator)
    {
        oGameTree.m_oDrawingNavigator.Create_FromGameTree();
        oGameTree.m_oDrawingNavigator.Update();
    }
};
CKGSClient.prototype.private_HandleChat = function(oMessage)
{
    if (oMessage.channelId === this.nCurrentChannelId)
    {
        OnAddChatMessage(oMessage.user.name, oMessage.text);
    }
};
CKGSClient.prototype.private_HandleUserAdded = function(oMessage)
{
    if (oMessage.channelId === this.nCurrentChannelId)
    {
        this.private_HandleUserRecord(oMessage.user, true);
        PlayersListView.Update_Size();
        PlayersListView.Update();
    }
};
CKGSClient.prototype.private_HandleUserRemoved = function(oMessage)
{
    if (oMessage.channelId === this.nCurrentChannelId)
    {
        this.private_HandleUserRecord(oMessage.user, false);
        PlayersListView.Update_Size();
        PlayersListView.Update();
    }
};
CKGSClient.prototype.private_HandleGameList = function(oMessage)
{
    var Games = oMessage.games;
    for (var Pos = 0, Count = Games.length; Pos < Count; ++Pos)
    {
        var oEntry = Games[Pos];
        this.private_HandleGameRecord(oEntry, true);
    }
    GamesListView.Update_Size();
    GamesListView.Update();
};
CKGSClient.prototype.private_HandleGameContainerRemoveGame = function(oMessage)
{
    GamesListView.Handle_Record([1, oMessage.gameId]);
    GamesListView.Update_Size();
    GamesListView.Update();
};
CKGSClient.prototype.private_GetRank = function(sRank)
{
    if (!sRank)
        return -1;

    if (-1 !== sRank.indexOf("k"))
    {
        var nValue = Math.max(1, Math.min(30, parseInt(sRank)));
        return 30 - nValue;
    }
    else if (-1 !== sRank.indexOf("d"))
    {
        var nValue = Math.max(1, Math.min(20, parseInt(sRank)));
        return nValue + 29;
    }
    else if (-1 !== sRank.indexOf("p"))
    {
        var nValue = Math.max(1, parseInt(sRank));
        return nValue + 49;
    }
    else if (-1 !== sRank.indexOf("-"))
    {
        return -1;
    }

    return -2;
};
CKGSClient.prototype.private_IsFriend = function(sUserName)
{
    if (1 === this.m_aFriends[sUserName])
        return true;

    return false;
};
