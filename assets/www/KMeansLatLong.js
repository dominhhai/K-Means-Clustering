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
// function getRandomInt(min, max) {
//   return Math.floor( Math.random() * (max - min + 1) ) + min;
// }

// min から max までの乱整数を返す関数
// Math.round() を用いると、非一様分布になります!
// function getRandomArbitary(min, max) {
//   return Math.random() * (max - min) + min;
// }

var R = 100, ER = 6371 * 1000;

var dataSet = [
        new Point(34.41, 135.30, 'p0'),
        new Point(34.4243, 135.3725, 'p1'),
        new Point(36.555112, 139.882807, 'p2'),
        new Point(26.228892, 127.303157, 'p3'),
        new Point(34.41, 135.30, 'p4'),
        new Point(34.4243, 135.3725, 'p5'),
        new Point(34.9753966, 135.7501003, 'p6'),
        new Point(21.25697,105.580361, 'p7'),
        new Point(21.256965,105.580362, 'p8'),
        new Point(21.256967,105.580381, 'p9'),
        new Point(21.256936,105.580359, 'p10'),
        new Point(21.254871,105.581725, 'p11'),
        new Point(21.246392,105.580008, 'p12'),
        new Point(34.41, 135.30, 'p0'),
        new Point(34.4243, 135.3725, 'p1'),
        new Point(36.555112, 139.882807, 'p2'),
        new Point(26.228892, 127.303157, 'p3'),
        new Point(34.41, 135.30, 'p4'),
        new Point(34.4243, 135.3725, 'p5'),
        new Point(34.9753966, 135.7501003, 'p6'),
        new Point(21.25697,105.580361, 'p7'),
        new Point(21.256965,105.580362, 'p8'),
        new Point(21.256967,105.580381, 'p9'),
        new Point(21.256936,105.580359, 'p10'),
        new Point(21.254871,105.581725, 'p11'),
        new Point(21.246392,105.580008, 'p12'),
        new Point(34.41, 135.30, 'p0'),
        new Point(34.4243, 135.3725, 'p1'),
        new Point(36.555112, 139.882807, 'p2'),
        new Point(26.228892, 127.303157, 'p3'),
        new Point(34.41, 135.30, 'p4'),
        new Point(34.4243, 135.3725, 'p5'),
        new Point(34.9753966, 135.7501003, 'p6'),
        new Point(21.25697,105.580361, 'p7'),
        new Point(21.256965,105.580362, 'p8'),
        new Point(21.256967,105.580381, 'p9'),
        new Point(21.256936,105.580359, 'p10'),
        new Point(21.254871,105.581725, 'p11'),
        new Point(21.246392,105.580008, 'p12')
    ];

var centroids = [dataSet[0].clone()];

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
        console.log("center " + i + ": (" + point.x + ", " + point.y + ")");
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
                // console.log(pi + " <-> " + gi + ": " + distance);
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

function calDist(point1, point2) {
    var lat1 = point1.x,
        lat2 = point2.x,
        lon1 = point1.y,
        lon2 = point2.y;
    var dLat = (lat2 - lat1) * Math.PI / 180,  // deg2rad below
        dLon = (lon2 - lon1) * Math.PI / 180;
    var a = 0.5 - Math.cos(dLat)/2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon))/2;

    return ER * 2 * Math.asin(Math.sqrt(a));
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