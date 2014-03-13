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


var R = 100, K = 5;

var dataSet = [
        new Point(80, 312, 'p1'),
        new Point(165, 452, 'p2'),
        new Point(218, 81, 'p3'),
        new Point(250, 153, 'p4'),
        new Point(190, 41, 'p5'),
        new Point(115, 288, 'p6'),
        new Point(151, 383, 'p7'),
        new Point(304, 273, 'p8'),
        new Point(38, 20, 'p9'),
        new Point(184, 468, 'p10'),
        new Point(5, 468, 'p11'),        
        new Point(145, 54, 'p61'),
        new Point(102, 70, 'p12'),
        new Point(284, 484, 'p13'),
        new Point(36, 196, 'p14'),
        new Point(204, 331, 'p15'),
        new Point(148, 407, 'p16'),
        new Point(189, 368, 'p17'),
        new Point(121, 423, 'p18'),
        new Point(232, 253, 'p19'),
        new Point(132, 209, 'p20'),
        new Point(156, 464, 'p21'),
        new Point(102, 261, 'p22'),
        new Point(249, 392, 'p23'),
        new Point(83, 170, 'p24'),
        new Point(92, 237, 'p25'),
        new Point(241, 372, 'p26'),
        new Point(154, 468, 'p27'),
        new Point(278, 211, 'p28'),
        new Point(43, 78, 'p29'),
        new Point(264, 165, 'p30'),
        new Point(61, 83, 'p31'),
        new Point(133, 216, 'p32'),
        new Point(93, 136, 'p33'),
        new Point(32, 210, 'p34'),
        new Point(131, 384, 'p35'),
        new Point(118, 148, 'p36'),
        new Point(295, 365, 'p37'),
        new Point(16, 362, 'p38'),
        new Point(220, 110, 'p39'),
        new Point(183, 487, 'p40'),
        new Point(225, 481, 'p41'),
        new Point(56, 191, 'p42'),
        new Point(80, 4, 'p43'),
        new Point(116, 281, 'p44'),
        new Point(194, 355, 'p45'),
        new Point(47, 159, 'p46'),
        new Point(144, 126, 'p47'),
        new Point(219, 421, 'p48'),
        new Point(259, 199, 'p49'),
        new Point(123, 238, 'p50'),
        new Point(84, 399, 'p51'),
        new Point(110, 281, 'p52'),
        new Point(214, 10, 'p53'),
        new Point(77, 368, 'p54'),
        new Point(223, 348, 'p55'),
        new Point(171, 460, 'p56'),
        new Point(5, 318, 'p57'),
        new Point(195, 49, 'p58'),
        new Point(197, 435, 'p59'),
        new Point(226, 393, 'p60')
    ];
    
var centroids = [dataSet[0].clone(), dataSet[1].clone(), dataSet[2].clone(), dataSet[3].clone(), dataSet[4].clone()];

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
        // console.log("centroids " + i + ": (" + point.x + "; " + point.y + ")");
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
        for (var i = 0; i < K; i ++) {
            curGroup.push([]);
        }
        console.log("cal distance");
        for (var pi = dataSet.length - 1; pi >= 0; pi --) {
            var minIndex = -1, minDist = -1;
            for (var gi = centroids.length - 1; gi >= 0; gi --) {
                var distance = calDist(dataSet[pi], centroids[gi]);
                if (distance < minDist || minDist == -1) {
                    minDist = distance;
                    minIndex = gi;
                }
                console.log(pi + " <-> " + gi + ": " + distance);
            }
            curGroup[minIndex].push(pi);
        }
        calGroupCentroid(curGroup);
        draw();
        if (compareGroup(curGroup, preGroup)) {
            console.log("result");
            for (var i = 0; i < curGroup.length; i ++) {
                console.log(i + ": " + JSON.stringify(curGroup[i]));
            }
            break;
        } else {
            preGroup = copyGroup(curGroup);  
        }
    }
    
    _end = (new Date()).getTime();
    console.log("Timer: START at: " + _start + "; END at: " + _end + "; SPEND: " + (_end - _start));
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

