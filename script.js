var WhiteTurn=false;
var mustToAttack=false;
var mustToDoubleAttack=false;
var amountOfWhiteCheckers=12;
var amountOfBlackCheckers=12;
var endGame=false;
var priorCoordinateOfSelectedKing;
setCoordinateIdAttributeToCells();
var board=getInitialBoard();
changeTurn();

function getInitialBoard()
{
    var boardToInit=[];
    var classNameOfCell="";
    for(var i=0;i<=63;i++){
    classNameOfCell=document.getElementById(i).getAttribute("class");
      if(classNameOfCell.indexOf("black_cell")!=-1){
          if(i>=0 && i<=23){    
            boardToInit[i]=new Checker("B");
          }
          else{
            if(i>=40 && i<=63){
                boardToInit[i]=new Checker("W"); 
            }
            else{
                boardToInit[i]= null;
            }
          }
        }
      else{
          boardToInit[i]=null;
      }
    }
    return boardToInit;
}

function Checker(color)
{
    this.color=color;
}

Checker.prototype.getPossibleMoves=function (coordinateOfSelectedChecker){
    var possibleMoves=[];
    var noAttackMoves=this.getNoAttackMoves(coordinateOfSelectedChecker);
    var attackMoves=this.getAttackMoves(coordinateOfSelectedChecker);
        for(var i=0;i<noAttackMoves.length;i++){
            possibleMoves.push(noAttackMoves[i]);
        }
        for(var i=0;i<attackMoves.length;i++){
            possibleMoves.push(attackMoves[i]);
        }
    return possibleMoves;
}

Checker.prototype.getNoAttackMoves= function(coordinateOfSelectedChecker){
    var numberOfStepsFromCurrentCoordinate=[7,9];
    var possibleMoves=[];
    var k=0;
    var nextPossibleCoordinateToMoveTo=0;
    var nextCell;
    for(var i =0;i<numberOfStepsFromCurrentCoordinate.length;i++){
        nextPossibleCoordinateToMoveTo=this.color=="W"?coordinateOfSelectedChecker+(-numberOfStepsFromCurrentCoordinate[i]):coordinateOfSelectedChecker+(numberOfStepsFromCurrentCoordinate[i]);
        if(coordinateIsOnBoard(nextPossibleCoordinateToMoveTo) &&
          !nextStepIsOutOfBoardRange(coordinateOfSelectedChecker,this,numberOfStepsFromCurrentCoordinate[i],false)
          ){
            nextCell = board[nextPossibleCoordinateToMoveTo];
            if(nextCell===null){
                possibleMoves[k]=new Move(this,coordinateOfSelectedChecker,nextPossibleCoordinateToMoveTo,null,-1)
                k++;
            }    
        }
    }   
return possibleMoves;
}

Checker.prototype.getAttackMoves= function (coordinateOfSelectedChecker){
    var numberOfStepsFromCurrentCoordinate=[7,9];
    var possibleMoves=[];
    var k=0;
    var nextPossibleCoordinateToMoveTo=0;
    var coordinateOfAttackedChecker=0;
    for(var i =0;i<numberOfStepsFromCurrentCoordinate.length;i++){
        nextPossibleCoordinateToMoveTo=this.color=="W"?coordinateOfSelectedChecker+((-numberOfStepsFromCurrentCoordinate[i])*2):coordinateOfSelectedChecker+(numberOfStepsFromCurrentCoordinate[i]*2);
        coordinateOfAttackedChecker=this.color=="W"?coordinateOfSelectedChecker+(-numberOfStepsFromCurrentCoordinate[i]):coordinateOfSelectedChecker+(numberOfStepsFromCurrentCoordinate[i]);
        if(coordinateIsOnBoard(nextPossibleCoordinateToMoveTo)&&
           !nextStepIsOutOfBoardRange(coordinateOfSelectedChecker,this,numberOfStepsFromCurrentCoordinate[i],true)
        ){
            if(board[coordinateOfAttackedChecker]!=null && 
                board[coordinateOfAttackedChecker].color!=this.color &&
                board[nextPossibleCoordinateToMoveTo]===null){
                possibleMoves[k]=new Move(this,coordinateOfSelectedChecker,nextPossibleCoordinateToMoveTo,board[coordinateOfAttackedChecker],coordinateOfAttackedChecker)
                k++;
            }
        }   
    }
    return possibleMoves;
}

Checker.prototype.isCapableToDoubleAttack= function (lastMoveMadeBySameChecker){
    var currentCordinateOfSelectedChecker=lastMoveMadeBySameChecker.destinationCoordinate;
    var priorMoveWasAttackMove=lastMoveMadeBySameChecker.attackedChecker!=null;
    setPriorCoordinateOfSelectedKing(lastMoveMadeBySameChecker);
    var currentMoveCanBeAttackMove=this.getAttackMoves(currentCordinateOfSelectedChecker).length != 0;
    return  currentMoveCanBeAttackMove &&
            priorMoveWasAttackMove 
}

function King(color){
    Checker.call(this,color);
}

Checker.prototype.checkIfIsCapableToDoubleAttackOrChangeTurn= function (moveToExecute){
    if(this.isCapableToDoubleAttack(moveToExecute)){
        makeCurrentCheckerCapableToDoubleAttack(moveToExecute.destinationCoordinate);
    }
    else{
    changeTurn();
    }
}

King.prototype=Object.create(Checker.prototype,{
                    constructor:{
                        configurable:true,
                        enumerable:true,
                        value:King,
                        writable:true
                    }
                });

King.prototype.getNoAttackMoves= function(coordinateOfKing){
    var possibleMoves=[];
    var k=0;
    var nextPossibleCoordinateToMoveTo;
    var currentCoordinateOfKing=coordinateOfKing;
    var numberOfStepsFromCurrentCoordinate=[-9,-7,7,9];
    var cellDestinationIsValid;
    for(var i =0;i<numberOfStepsFromCurrentCoordinate.length;i++){
        cellDestinationIsValid=true;
        nextPossibleCoordinateToMoveTo=coordinateOfKing+(numberOfStepsFromCurrentCoordinate[i]);
        while(board[nextPossibleCoordinateToMoveTo]===null && cellDestinationIsValid){
            if(coordinateIsOnBoard(nextPossibleCoordinateToMoveTo) &&
              !nextStepIsOutOfBoardRange(currentCoordinateOfKing,this,numberOfStepsFromCurrentCoordinate[i],false) &&
               board[nextPossibleCoordinateToMoveTo]===null){
                    possibleMoves[k]=new Move(this,coordinateOfKing,nextPossibleCoordinateToMoveTo,null,-1)
                    k++;     
            }
            else{
                cellDestinationIsValid=false;
            }
            currentCoordinateOfKing=nextPossibleCoordinateToMoveTo;
            nextPossibleCoordinateToMoveTo+=numberOfStepsFromCurrentCoordinate[i];
        }
        currentCoordinateOfKing=coordinateOfKing;
    }  
return possibleMoves;
}

King.prototype.getAttackMoves= function (coordinateOfKing){
    var possibleMoves=[];
    var nextPossibleCoordinateToMoveTo;
    var nextCellAfterAttackedChecker;
    var numberOfStepsFromCurrentCoordinate=[-9,-7,7,9];
    var coordinateOfPotentialAttackedCheckerByKing;
    for(var i =0;i<numberOfStepsFromCurrentCoordinate.length;i++){
        nextPossibleCoordinateToMoveTo=coordinateOfKing+(numberOfStepsFromCurrentCoordinate[i]);
        coordinateOfPotentialAttackedCheckerByKing= getCoordinateOfPotentialAttackedCheckerByKing(nextPossibleCoordinateToMoveTo,this,
                                                                                                 coordinateOfKing,numberOfStepsFromCurrentCoordinate[i]
                                                                                                 );
        if(coordinateOfPotentialAttackedCheckerByKing!=-1){
            nextCellAfterAttackedChecker=coordinateOfPotentialAttackedCheckerByKing;
            if(board[coordinateOfPotentialAttackedCheckerByKing].color!=this.color){
                while(attackedCheckerCanBeAttackedByKing(nextCellAfterAttackedChecker,numberOfStepsFromCurrentCoordinate[i],
                    coordinateOfKing)
                    ){
                        nextCellAfterAttackedChecker+=numberOfStepsFromCurrentCoordinate[i];
                        possibleMoves.push(new Move(this,coordinateOfKing,nextCellAfterAttackedChecker,board[coordinateOfPotentialAttackedCheckerByKing],coordinateOfPotentialAttackedCheckerByKing));
                }
            }
        }       
    }     
return possibleMoves;
}

function attackedCheckerCanBeAttackedByKing(attackedCheckerCoordinate,numberOfStepsFromAttackedChecker,currentCoordinateOfKing){
var diagonalCellCoordinateAfterAttackedChecker=attackedCheckerCoordinate+numberOfStepsFromAttackedChecker;
return  board[diagonalCellCoordinateAfterAttackedChecker]===null &&
coordinateIsOnBoard(diagonalCellCoordinateAfterAttackedChecker)&&
!coordinateIsOnSpecificColumn(1,attackedCheckerCoordinate)&&
!coordinateIsOnSpecificColumn(8,attackedCheckerCoordinate)&&
!destinationCoordinateIsBackwards(currentCoordinateOfKing,diagonalCellCoordinateAfterAttackedChecker);
}

function getCoordinateOfPotentialAttackedCheckerByKing(nextPossibleCoordinateToMoveTo,king,currentCoordinateOfKing,numberOfStepsFromCurrentCoordinate){
    var cellIsEmpty=true;
    var cellIsValid=true;
        while(cellIsEmpty && cellIsValid){
            if(coordinateIsOnBoard(nextPossibleCoordinateToMoveTo)&&
                !nextStepIsOutOfBoardRange(currentCoordinateOfKing,king,numberOfStepsFromCurrentCoordinate,true)){
                    if(board[nextPossibleCoordinateToMoveTo]===null){
                        currentCoordinateOfKing=nextPossibleCoordinateToMoveTo;
                        nextPossibleCoordinateToMoveTo+=numberOfStepsFromCurrentCoordinate;
                    }
                    else{
                        cellIsEmpty=false;
                    }          
            }
            else{
                cellIsValid=false;
            }
        }
    return cellIsValid?nextPossibleCoordinateToMoveTo:-1;
}

function destinationCoordinateIsBackwards(coordinateOfKing,nextPossibleCoordinateToMoveTo){
    var isBackwardsToSomeSide;
    var isBackwardsToAnotherSide;
    if(priorCoordinateOfSelectedKing!=undefined){
       isBackwardsToSomeSide= (coordinateOfKing-priorCoordinateOfSelectedKing)%9==0&&
        (coordinateOfKing-nextPossibleCoordinateToMoveTo)%9==0&&
       ((coordinateOfKing>priorCoordinateOfSelectedKing && priorCoordinateOfSelectedKing>nextPossibleCoordinateToMoveTo)||
       (coordinateOfKing<priorCoordinateOfSelectedKing && priorCoordinateOfSelectedKing<nextPossibleCoordinateToMoveTo));

        
        isBackwardsToAnotherSide=(coordinateOfKing-priorCoordinateOfSelectedKing)%7==0&&
        (coordinateOfKing-nextPossibleCoordinateToMoveTo)%7==0&&
        ((coordinateOfKing>priorCoordinateOfSelectedKing  && priorCoordinateOfSelectedKing>nextPossibleCoordinateToMoveTo)||
        (coordinateOfKing<priorCoordinateOfSelectedKing && priorCoordinateOfSelectedKing<nextPossibleCoordinateToMoveTo));

        return isBackwardsToAnotherSide||isBackwardsToSomeSide;
    }
    return false;
}

function setPriorCoordinateOfSelectedKing(move){
    if(move.movedChecker instanceof King){
        priorCoordinateOfSelectedKing=move.coordinateOfMovedChecker;
    }
    else{
        priorCoordinateOfSelectedKing=undefined;
    }
}

function Move(movedChecker,coordinateOfMovedChecker,destinationCoordinate,attackedChecker,coordinateOfAttackedChecker)
{
    this.movedChecker=movedChecker;
    this.coordinateOfMovedChecker=coordinateOfMovedChecker;
    this.destinationCoordinate=destinationCoordinate;
    this.attackedChecker=attackedChecker;
    this.coordinateOfAttackedChecker=coordinateOfAttackedChecker;
}

Move.prototype.executeMove=function (possibleMoves,coordinatesOfCheckersThatMustAttack){
        var movedChecker=this.movedChecker;
        this.moveCheckerToDestinationCoordinateOnBoard()
        this.checkIfIsTransformToKingMoveAndTransform();
        this.updateBoardAndDomAboutTheMove(coordinatesOfCheckersThatMustAttack);       
        fixOnClickPropertyOfElements(this,possibleMoves);
        updateAmountOfOneColorCheckers(this);
        checkIfIsWinAndEndGame(this);
        if(!endGame){
        movedChecker.checkIfIsCapableToDoubleAttackOrChangeTurn(this);
        }
}

Move.prototype.moveCheckerToDestinationCoordinateOnBoard= function(){
    var coordinateOfMovedChecker = this.coordinateOfMovedChecker;
    board[coordinateOfMovedChecker]=null;
    board[this.destinationCoordinate]=this.movedChecker;
}

Move.prototype.isTransformToKingMove= function()
{
    if(this.movedChecker.color==="W" && !(this.movedChecker instanceof King)){
        if(this.destinationCoordinate>=0 && this.destinationCoordinate<=7){
            return true;
        }
    }
    if(this.movedChecker.color==="B" && !(this.movedChecker instanceof King)){
        if(this.destinationCoordinate>=56 && this.destinationCoordinate<=63){
            return true;
        }
    }
    return false;
}

Move.prototype.checkIfIsTransformToKingMoveAndTransform =function(){
    if(this.isTransformToKingMove()){
        var checkerColor=this.movedChecker.color;
        board[this.destinationCoordinate] = new King(checkerColor);
    }
}

Move.prototype.updateBoardAndDomAboutTheMove=function(coordinatesOfCheckersThatMustAttack){
    if(this.attackedChecker!=null){
        board[this.coordinateOfAttackedChecker]=null;
        document.getElementById(this.coordinateOfAttackedChecker).innerHTML="";
        
    }
    document.getElementById(this.destinationCoordinate).innerHTML=document.getElementById(this.coordinateOfMovedChecker).innerHTML;
    document.getElementById(this.coordinateOfMovedChecker).innerHTML="";
    if(mustToAttack && this.attackedChecker===null){
        removeCheckersFromBoardAndDom(coordinatesOfCheckersThatMustAttack, this);
    }  
    if(board[this.destinationCoordinate]!=null &&
        board[this.destinationCoordinate] instanceof King
        ){
        kingHasCellClassElement= document.getElementById([this.destinationCoordinate]);
        kingDivElement=kingHasCellClassElement.getElementsByTagName("div");
        kingDivElement[0].style.border= " .2vw solid yellow";
    }
}

function removeCheckersFromBoardAndDom(coordinatesOfCheckersThatMustAttack, moveToExecute){
    for(var i=0;i<coordinatesOfCheckersThatMustAttack.length;i++){
        if(coordinatesOfCheckersThatMustAttack[i]==moveToExecute.coordinateOfMovedChecker){
            board[moveToExecute.destinationCoordinate]=null;
            document.getElementById(moveToExecute.destinationCoordinate).innerHTML="";
            
        }
        else{
        board[coordinatesOfCheckersThatMustAttack[i]]=null;
        document.getElementById(coordinatesOfCheckersThatMustAttack[i]).innerHTML="";
        }
        moveToExecute.movedChecker.color=="W"?amountOfWhiteCheckers--:amountOfBlackCheckers--;
    }
}

function makeMove(){
    var coordinateOfSelectedChecker=Number(this.parentNode.getAttribute("id"));
    var selectedChecker = board[coordinateOfSelectedChecker];
    var possibleMoves;
    var colorOfCurrentPlayer=selectedChecker.color;
    var coordinatesOfCheckersThatMustAttack =getCoordinatesOfCheckersThatMustAttack(colorOfCurrentPlayer);
    playerIsMustToAttack(coordinatesOfCheckersThatMustAttack);
    if(mustToDoubleAttack){
        possibleMoves=selectedChecker.getAttackMoves(coordinateOfSelectedChecker);
    }
    else{
        possibleMoves= selectedChecker.getPossibleMoves(coordinateOfSelectedChecker);
    }
    var cellDestinationElement=null;
    for(var i=0;i<possibleMoves.length;i++){
        cellDestinationElement=document.getElementById(possibleMoves[i].destinationCoordinate);
        cellDestinationElement.onclick= possibleMoves[i].executeMove.bind(possibleMoves[i],possibleMoves,coordinatesOfCheckersThatMustAttack);
    }
}

function getCoordinatesOfCheckersThatMustAttack(playerColor){
    var checkersColorClass=playerColor==="W"?"white_checker":"black_checker";
    var checkersElemnts= document.getElementsByClassName(checkersColorClass);
    var coordinateOfCurrentChecker;
    var currentChecker;
    var coordinatesOfCheckersThatMustAttack=[];
    for(var i=0;i<checkersElemnts.length;i++){
        coordinateOfCurrentChecker=Number(checkersElemnts[i].parentNode.getAttribute("id"));
        currentChecker=board[coordinateOfCurrentChecker];
        if(currentChecker.getAttackMoves(coordinateOfCurrentChecker).length!=0){
            coordinatesOfCheckersThatMustAttack.push(coordinateOfCurrentChecker);
        }
    }
    return coordinatesOfCheckersThatMustAttack;
}

function playerIsMustToAttack(coordinatesOfCheckersThatMustAttack){
    if(coordinatesOfCheckersThatMustAttack.length!=0){
        mustToAttack=true;;
    }
    else{
        mustToAttack=false;
    }
}

function setCoordinateIdAttributeToCells(array)
{
    var elementsWithCellClass =document.getElementsByClassName("cell");
    for(var i=0;i<elementsWithCellClass.length;i++)
    {
        elementsWithCellClass[i].setAttribute("id",i);
    }
}

function changeTurn(){
    priorCoordinateOfSelectedKing=undefined;
    mustToDoubleAttack=false;
    WhiteTurn=!WhiteTurn;
    var checkerClassNameOfCurrentTurn=WhiteTurn?"white_checker":"black_checker";
    var checkerClassNameOfNotCurrentTurn=WhiteTurn?"black_checker":"white_checker";
    var allAliveCheckersOfOneColorInCurrentTurn=document.getElementsByClassName(checkerClassNameOfCurrentTurn);
    var allAliveCheckersOfOneColorOfNotCurrentTurn=document.getElementsByClassName(checkerClassNameOfNotCurrentTurn);
    for(var i=0;i<allAliveCheckersOfOneColorInCurrentTurn.length;i++)
    {       
        allAliveCheckersOfOneColorInCurrentTurn[i].onclick=  makeMove;
    }
    for(var i=0;i<allAliveCheckersOfOneColorOfNotCurrentTurn.length;i++){
        allAliveCheckersOfOneColorOfNotCurrentTurn[i].onclick=null;
    }
}

function makeCurrentCheckerCapableToDoubleAttack(coordinateOfCurrentChecker){
    mustToDoubleAttack=true;
    var allAliveCheckersOfOneColorInCurrentTurn=document.getElementsByClassName(WhiteTurn?"white_checker":"black_checker");
    var coordinateOfNoCurrentChecker;
    for(var i=0;i<allAliveCheckersOfOneColorInCurrentTurn.length;i++){
        coordinateOfNoCurrentChecker=Number(allAliveCheckersOfOneColorInCurrentTurn[i].parentNode.getAttribute("id"));
        if(coordinateOfNoCurrentChecker!=coordinateOfCurrentChecker){
            allAliveCheckersOfOneColorInCurrentTurn[i].onclick=null;
        }
    }
}

function coordinateIsOnSpecificColumn(columnNumber,coordinate){
    var remain;
    switch(columnNumber){
        case 1:remain=0;break;
        case 2:remain=1;break;
        case 7:remain =6;break;
        case 8:remain=7;break;
    }
    if (coordinate%8===remain){
        return true;
    }
    return false;
}

function nextStepIsOutOfBoardRange(coordinateOfSelectedChecker, checker,numberOfStepsFromCurrentCoordinate,isAttackMove){
    var destinationCoordinate= coordinateOfSelectedChecker+numberOfStepsFromCurrentCoordinate;
    if(numberOfStepsFromCurrentCoordinate<0){
        numberOfStepsFromCurrentCoordinate*=-1;
    }
    var coordinateOfSelectedWhiteCheckerisProblematic= isProblematicCoordinateOfWhiteChecker(coordinateOfSelectedChecker,numberOfStepsFromCurrentCoordinate,isAttackMove);
    var coordinateOfSelectedBlackCheckerisProblematic=isProblematicCoordinateOfBlackChecker(coordinateOfSelectedChecker,numberOfStepsFromCurrentCoordinate,isAttackMove);
    if(checker instanceof King ){
        if(checker.color=="W" && destinationCoordinate>coordinateOfSelectedChecker){
            return coordinateOfSelectedBlackCheckerisProblematic;
        }
        if(checker.color=="B"&& destinationCoordinate<coordinateOfSelectedChecker){
            return coordinateOfSelectedWhiteCheckerisProblematic;
        }
    }
    if(checker.color=="W"){
        return coordinateOfSelectedWhiteCheckerisProblematic;
    }
    return coordinateOfSelectedBlackCheckerisProblematic;
}

function isProblematicCoordinateOfBlackChecker(coordinateOfSelectedChecker,numberOfStepsFromCurrentCoordinate,isAttackMove){
    return (coordinateIsOnSpecificColumn(1,coordinateOfSelectedChecker)&& numberOfStepsFromCurrentCoordinate===7) && !isAttackMove ||
            (coordinateIsOnSpecificColumn(8,coordinateOfSelectedChecker) && numberOfStepsFromCurrentCoordinate===9) && !isAttackMove ||
            (coordinateIsOnSpecificColumn(7,coordinateOfSelectedChecker) && numberOfStepsFromCurrentCoordinate===9 && isAttackMove)||
            (coordinateIsOnSpecificColumn(2,coordinateOfSelectedChecker) && numberOfStepsFromCurrentCoordinate===7 && isAttackMove);
}

function isProblematicCoordinateOfWhiteChecker(coordinateOfSelectedChecker,numberOfStepsFromCurrentCoordinate,isAttackMove){
    return  (coordinateIsOnSpecificColumn(1,coordinateOfSelectedChecker)&& numberOfStepsFromCurrentCoordinate===9) && !isAttackMove||
            (coordinateIsOnSpecificColumn(8,coordinateOfSelectedChecker) && numberOfStepsFromCurrentCoordinate===7) && !isAttackMove ||
            (coordinateIsOnSpecificColumn(7,coordinateOfSelectedChecker) && numberOfStepsFromCurrentCoordinate===7 && isAttackMove)||
            (coordinateIsOnSpecificColumn(2,coordinateOfSelectedChecker) && numberOfStepsFromCurrentCoordinate===9 && isAttackMove) ; 
}

function fixOnClickPropertyOfElements(selectedMove,possibleMoves){
    removeOnClickPropertyOfDestinationCellsElemntsOfCurrentTurn(possibleMoves);
    addOnClickPropertyOfMovedCheckerElement(selectedMove);
}

function removeOnClickPropertyOfDestinationCellsElemntsOfCurrentTurn(possibleMoves){
    var cellDestinationElement;
    for(var i=0;i<possibleMoves.length;i++){
        cellDestinationElement=document.getElementById(possibleMoves[i].destinationCoordinate);
        cellDestinationElement.onclick=null;  
    }
}

function addOnClickPropertyOfMovedCheckerElement(selectedMove){
    var checkerOncellDestinationElement;
    var  cellDestinationElement=document.getElementById(selectedMove.destinationCoordinate);
    if(cellDestinationElement.getElementsByTagName("div").length!=0){
        checkerOncellDestinationElement=cellDestinationElement.getElementsByClassName("checker");
        checkerOncellDestinationElement[0].onclick=makeMove;
    }
}

function removeOnClickPropertyOfAllCheckers(){
    var checkersEllements=document.getElementsByClassName("checker");
    for(var i=0;i<checkersEllements.length;i++){
        checkersEllements[i].onclick="";
    }
}

function coordinateIsOnBoard(coordinate){
    if(coordinate>=0 && coordinate<=63){
        return true;
    }
    return false;
}


function updateAmountOfOneColorCheckers(move){
    if(move.attackedChecker!=null){
        move.attackedChecker.color==="W"?amountOfWhiteCheckers--:amountOfBlackCheckers--;
    }
}


function checkIfIsWinAndEndGame(move){
    if(isWin(move.movedChecker.color)){
        removeOnClickPropertyOfAllCheckers();
        endGame=true;
        showMessege(move);
    }
}

function isWin(colorOfCurrentPlayer){
  return  oneSideIsOutOfMaterial()||
          !(oneSideHasPossibleMoves(colorOfCurrentPlayer));
}

function oneSideIsOutOfMaterial(){
    if(amountOfBlackCheckers==0 || amountOfWhiteCheckers==0){
        return true;
    }
    return false;
}

function oneSideHasPossibleMoves(colorOfCurrentPlayer){
    var classNameOfOpponentCheckers=colorOfCurrentPlayer==="W"?"black_checker":"white_checker";
    var checkersElemnts= document.getElementsByClassName(classNameOfOpponentCheckers);
    var coordinateOfCurrentChecker;
    var currentChecker;
    for(var i=0;i<checkersElemnts.length;i++){
        coordinateOfCurrentChecker=Number(checkersElemnts[i].parentNode.getAttribute("id"));
        currentChecker=board[coordinateOfCurrentChecker];
        if(currentChecker.getPossibleMoves(coordinateOfCurrentChecker).length!=0){
            return true;
        }
    }
    return false;
}

function showMessege(move){
    var colorOfCurrentPlayer=move.movedChecker.color;
    var winingColor;
    if(mustToAttack && move.attackedChecker===null){
        winingColor=colorOfCurrentPlayer=="W"?"Black":"White";
    }
    else{
        winingColor=colorOfCurrentPlayer=="W"?"White":"Black";
    }
    var divMessegeElement = document.getElementById("messege");
    divMessegeElement.style.backgroundColor=(winingColor=="Black"?"black":"red");
    var textNode=document.createTextNode(winingColor + " player has won the game");
    divMessegeElement.appendChild(textNode);   
}