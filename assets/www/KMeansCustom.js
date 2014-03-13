console.log("width: " + window.innerWidth + "; height: " + window.innerHeight);

function Point(x, y, name) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.group = -1;
}

Point.prototype.setPosition = function(x, y) {
  this.x = x;
  this.y = y;
};

Point.prototype.setGroup = function(group) {
  this.group = group;
};

Point.prototype.clone = function() {
    return (new Point(this.x, this.y, this.name));
};

// min から max までの乱数を返す関数
function getRandomInt(min, max) {
  return Math.floor( Math.random() * (max - min + 1) ) + min;
}

// min から max までの乱整数を返す関数
// Math.round() を用いると、非一様分布になります!
function getRandomArbitary(min, max) {
  return Math.random() * (max - min) + min;
}

var R = 100, SET = 80;

var dataSet = [];
for (var i = 0; i < SET; i ++) {
    dataSet.push(new Point(getRandomArbitary(0, 310), getRandomArbitary(0, 490), 'p' + i));    
}

var centroids = [dataSet[getRandomInt(0, SET - 1)].clone()];

function calDist(point1, point2) {
    var dx = point1.x - point2.x,
        dy = point1.y - point2.y;
        
    return Math.sqrt(dx*dx + dy*dy);
}

function draw() {
    console.log("drawing...");
    $( "#content .circle" ).remove();
    
    var content = '',
        wapper = $('#content');
    
    $.each(dataSet, function(i, point) {
        var name = point.name + "_" + (point.group == -1 ? '' : point.group);
        content = $("<div class='circle circle_local" + i + "'><span>" + name + "</span></div>");
        wapper.append(content);
        $(".circle_local" + i).css({'left': point.x + 'px', 'top': point.y + 'px'});
    });
    
    $.each(centroids, function(i, point) {
        var name = "c:" + i;
        content = $("<div class='circle_center circle_center_local" + i + "'><span>" + name + "</span></div>");
        wapper.append(content);
        var py = point.y - 30;
        $(".circle_center_local" + i).css({'left': point.x + 'px', 'top': py + 'px'});
    });
}

function clustering() {
    showSpinner();
    var _start = (new Date()).getTime(),
        _end;
    console.log("clustering...");
    
    var curGroup = [],
        preGroup = [];  
    while(true) {
        curGroup = [];
        for (var i = centroids.length - 1; i >=0 ; i --) {
            curGroup.push([]);    
        }
        for (var pi = dataSet.length - 1; pi >= 0; pi --) {
            var minIndex = -1, minDist = -1;
            for (var gi = 0; gi < centroids.length; gi ++) {
                var distance = calDist(dataSet[pi], centroids[gi]);
                if (distance < minDist || minDist == -1) {
                    minDist = distance;
                    minIndex = gi;
                }
            }
            if (minDist < R) {
                curGroup[minIndex].push(pi);
            } else {
                curGroup.push([pi]);
                centroids.push(dataSet[pi].clone());
            }
        }
        if (compareGroup(curGroup, preGroup)) {            
            break;
        } else {
            preGroup = copyGroup(curGroup);
            calGroupCentroid(curGroup);
        }
    }    
    
    _end = (new Date()).getTime();
    console.log("Timer: START at: " + _start + "; END at: " + _end + "; SPEND: " + (_end - _start));
    
    draw();
    
    console.log("result");
    for (var i = 0; i < curGroup.length; i ++) {
        console.log("group " + i + ": " + JSON.stringify(curGroup[i]));
    }
    
    hideSpinner();
}

function compareGroup(group1, group2) {
    if (group1.length != group2.length) {
        return false;
    } else {
        for (var i = group1.length - 1; i >= 0; i--) {
            if (group1[i].length !== group2[i].length) {
                return false;
            } else {
                for (var j = group1[i].length; j >= 0; j--) {
                    if (group1[i][j] !== group2[i][j]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}

function copyGroup(group) {
    var newGroup = [];
    for (var i = 0, j = group.length; i < j; i ++) {
        newGroup.push(group[i]);
    }
    return newGroup;
}

function calGroupCentroid (group) {
    for (var i = group.length - 1; i >= 0; i --) {
        var x = 0, y = 0;
        var curGroup = group[i], gLen = curGroup.length;
        if (gLen > 0) {
            for (var j = gLen - 1; j >= 0; j --) {
                x += dataSet[curGroup[j]].x;
                y += dataSet[curGroup[j]].y;
                
                dataSet[curGroup[j]].setGroup(i);
            }
            x = x / gLen;
            y = y / gLen;
            centroids[i].setPosition(x, y);
        }
    }
}

function showSpinner() {
    var options = {
        title: 'Clustering',
        titleColor: '#4169E1'
    };
    monaca.showSpinner(options);
}

function hideSpinner() {
    monaca.hideSpinner();
}

$(document).on('pagebeforeshow', '#page', function(){
    draw();
});

$(document).on('tap', '#cluster', function(){
    clustering();
});