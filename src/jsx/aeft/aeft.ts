export const example = () => {
  return extractPaths();
};

function extractPaths() {
  var comp = app.project.activeItem;
  var svgCode =
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 ' +
    comp.width +
    " " +
    comp.height +
    '" enable-background="new 0 0 ' +
    comp.width +
    " " +
    comp.height +
    '" xml:space="preserve">';

  var selected = comp.selectedLayers;
  // alert(selected[0].trackMatteLayer)
  // return false
  for (var s = selected.length - 1; s > -1; s--) {
    var selectedGroups = selected[s].property("ADBE Root Vectors Group");
    var layerName = selected[s].name;

    var layerPosX = selected[s].transform.xPosition;
    var layerPosY = selected[s].transform.yPosition;
    var layerPosValX, layerPosValY;
    if (layerPosX.numKeys > 0) {
      layerPosValX = layerPosX.keyValue(1);
    } else {
      layerPosValX = layerPosX.value;
    }
    if (layerPosY.numKeys > 0) {
      layerPosValY = layerPosY.keyValue(1);
    } else {
      layerPosValY = layerPosY.value;
    }
    var layerAnchor = selected[s].transform.anchorPoint;
    var layerPos = [layerPosValX, layerPosValY] - layerAnchor.value;

    svgCode +=
      '<g id="' +
      layerName +
      '-posX" class="' +
      layerName +
      '"><g id="' +
      layerName +
      '-posY" class="' +
      layerName +
      '"><g id="' +
      layerName +
      '-rot" class="' +
      layerName +
      '"><g id="' +
      layerName +
      '-scal" class="' +
      layerName +
      '"><g id="' +
      layerName +
      '-opa" ' +
      layerName +
      '="base">';

    for (var i = selectedGroups.numProperties; i >= 1; i--) {
      var localPos = selectedGroups(i)("ADBE Vector Transform Group")(
        "ADBE Vector Position"
      ).value;
      var localProp = selectedGroups(i)("ADBE Vectors Group");
      var groupFill = "black";
      var groupPath = "";
      for (var j = 1; j <= localProp.numProperties; j++) {
        var propName = localProp(j).matchName;
        if (propName === "ADBE Vector Shape - Group") {
          var localPath = localProp(j).path.value;

          var vert = roundAndSumRow(
            localPath.vertices,
            layerPos[0] + localPos[0],
            layerPos[1] + localPos[1]
          );
          var ins = roundAndSumPair(localPath.inTangents, 0, 0);
          var outs = roundAndSumPair(localPath.outTangents, 0, 0);

          groupPath += convertPointsToSVGPath(vert, ins, outs) + " ";
        }
        if (propName === "ADBE Vector Graphic - Fill") {
          var localFill = localProp(j)(4).value;
          groupFill = rgbToHex(
            localFill[0] * 255,
            localFill[1] * 255,
            localFill[2] * 255
          );
        }
      }
      svgCode += '<path fill="' + groupFill + '" d="' + groupPath + '"/>';
    }
    svgCode += "</g></g></g></g></g>";
  }
  svgCode += "</svg>";
  return svgCode;
}

function roundAndSumRow(arrayOfPairs: number[][], x: number, y: number) {
  var result = [];
  var len = arrayOfPairs.length;

  for (var i = 0; i < len; i++) {
    var pair = arrayOfPairs[i];

    var firstValue = pair[0] + x;
    var secondValue = pair[1] + y;

    var roundedFirstValue = Math.round(firstValue);
    var roundedSecondValue = Math.round(secondValue);

    result.push(roundedFirstValue);
    result.push(roundedSecondValue);
  }

  return result;
}

function roundAndSumPair(arrayOfPairs: number[][], x: number, y: number) {
  var result = [];

  for (var i = 0; i < arrayOfPairs.length; i++) {
    var pair = arrayOfPairs[i];
    var roundedPair = [];

    var roundedFirstValue = Math.round(pair[0]) + x;
    var roundedSecondValue = Math.round(pair[1]) + y;

    roundedPair.push(roundedFirstValue, roundedSecondValue);

    result.push(roundedPair);
  }

  return result;
}

function rgbToHex(red: any, green: any, blue: any) {
  var hex =
    "#" + ((1 << 24) | (red << 16) | (green << 8) | blue).toString(16).slice(1);
  return hex;
}

function convertPointsToSVGPath(points, inTangents, outTangents) {
  var path = "M";

  for (var i = 0; i < points.length; i += 2) {
    var x = points[i];
    var y = points[i + 1];

    if (i !== 0) {
      var prevX = points[i - 2];
      var prevY = points[i - 1];
      var inTangentX = prevX + outTangents[i / 2 - 1][0];
      var inTangentY = prevY + outTangents[i / 2 - 1][1];
      var outTangentX = x + inTangents[i / 2][0];
      var outTangentY = y + inTangents[i / 2][1];

      path +=
        " C" +
        inTangentX +
        "," +
        inTangentY +
        " " +
        outTangentX +
        "," +
        outTangentY +
        " " +
        x +
        "," +
        y;
    } else {
      path += x + "," + y;
    }
  }

  if (points.length > 2) {
    var firstX = points[0];
    var firstY = points[1];
    var lastX = points[points.length - 2];
    var lastY = points[points.length - 1];
    var lastInTangentX = lastX + outTangents[outTangents.length - 1][0];
    var lastInTangentY = lastY + outTangents[outTangents.length - 1][1];
    var firstOutTangentX = firstX + inTangents[0][0];
    var firstOutTangentY = firstY + inTangents[0][1];

    path +=
      " C" +
      lastInTangentX +
      "," +
      lastInTangentY +
      " " +
      firstOutTangentX +
      "," +
      firstOutTangentY +
      " " +
      firstX +
      "," +
      firstY +
      " Z";
  } else {
    path += " Z";
  }

  return path;
}
