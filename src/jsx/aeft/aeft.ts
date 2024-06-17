import { getActiveComp } from "./aeft-utils";

export const openWeb = (site: string) => {
  if (
    app.preferences.getPrefAsLong(
      "Main Pref Section",
      "Pref_SCRIPTING_FILE_NETWORK_SECURITY"
    ) != 1
  ) {
    alert(
      'Please tick the "Allow Scripts to Write Files and Access Network" checkbox if Preferences > General'
    );
    app.executeCommand(2359);
  }

  var os = system.osName;
  if (!os.length) {
    os = $.os;
  }
  var appOs = os.indexOf("Win") != -1 ? "Win" : "Mac";

  var url = site;
  if (appOs == "Win") {
    system.callSystem("explorer " + url);
  } else {
    system.callSystem("open " + url);
  }
};

export const goKeyflames = () => {
  return extractPaths() + `<style>\n${scanTransformToCSS()}</style></svg>`;
};

export const extractPaths = () => {
  var comp = getActiveComp();
  var svgCode =
    '<svg id="keyflames" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 ' +
    comp.width +
    " " +
    comp.height +
    '" enable-background="new 0 0 ' +
    comp.width +
    " " +
    comp.height +
    '" xml:space="preserve">';

  var selected = comp.selectedLayers;

  for (var s = selected.length - 1; s > -1; s--) {
    var selectedGroups = selected[s].property("ADBE Root Vectors Group");
    var layerName = selected[s].name;

    var layerPosX = selected[s].transform.xPosition;
    var layerPosY = selected[s].transform.yPosition;
    var layerPosValX = layerPosX.value;
    var layerPosValY = layerPosY.value;
    if (layerPosX.numKeys > 0) layerPosValX = layerPosX.keyValue(1);
    if (layerPosY.numKeys > 0) layerPosValY = layerPosY.keyValue(1);

    var layerAnchor: number[] = selected[s].transform.anchorPoint.value;
    var layerPosVal: number[] = [layerPosValX, layerPosValY];
    var layerPos: number[] = [];

    for (let i = 0; i < layerPosVal.length; i++) {
      layerPos[i] = layerPosVal[i] - layerAnchor[i];
    }

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
  // svgCode += "</svg>";
  return svgCode;
};

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

export const scanTransformToCSS = () => {
  var props = [
    ["ADBE Scale", "scal"],
    ["ADBE Rotate Z", "rot"],
    ["ADBE Position_0", "posX"],
    ["ADBE Position_1", "posY"],
    ["ADBE Opacity", "opa"],
  ];

  var cssText = "";

  var selected = app.project.activeItem.selectedLayers;
  for (var s = 0; s < selected.length; s++) {
    var layerName = selected[s].name;

    const ancX = selected[s].transform.anchorPoint.value[0];
    const ancY = selected[s].transform.anchorPoint.value[1];
    const anchorToComp = selected[s].sourcePointToComp([ancX, ancY]);

    var keysGlobal = [],
      keysLocal = [];

    for (var i = 0; i < props.length; i++) {
      var prop = selected[s].transform.property(props[i][0]);
      var keySelection = prop.numKeys;

      if (keySelection > 0) {
        for (var j = 0; j < keySelection - 1; j++) {
          var keyOut = prop.keyOutTemporalEase(j + 1);
          var keyIn = prop.keyInTemporalEase(j + 2);

          var vel1 = [keyOut][0][0].speed;
          var vel2 = [keyIn][0][0].speed;
          var a = [keyOut][0][0].influence / 100;
          var c = 1 - [keyIn][0][0].influence / 100;

          var t1 = prop.keyTime(j + 1);
          var t2 = prop.keyTime(j + 2);

          var v1Base = prop.keyValue(j + 1);
          var v2Base = prop.keyValue(j + 2);

          var v1 = getValue(v1Base);
          var v2 = getValue(v2Base);
          var dif = (t2 - t1) / (v2 - v1);

          var b = a * vel1 * dif;
          var d = 1 - (1 - c) * vel2 * dif;

          keysLocal.push([
            t1,
            t2,
            "(" +
              formatCubic(a) +
              "," +
              formatCubic(b) +
              "," +
              formatCubic(c) +
              "," +
              formatCubic(d) +
              ")",
            prop.matchName,
            v1Base,
            v2Base,
          ]);
        }
        keysGlobal.push(keysLocal);
        keysLocal = [];
      }
    }

    for (var l = 0; l < keysGlobal.length; l++) {
      var keys = keysGlobal[l];

      for (var p = 0; p < props.length; p++) {
        if (props[p][0] === keys[0][3]) {
          var propName = props[p][1];
        }
      }
      var layerPropName = layerName + "-" + propName;
      var animName = "anim-" + layerPropName;
      cssText += "@keyframes " + animName + " {\n   0% {";

      for (var k = 0; k < keys.length; k++) {
        var pert = Math.round(
          (100 * keys[k][1]) / (keys[keys.length - 1][1] - keys[0][0])
        );

        if (keys[k][3] === props[0][0]) {
          cssText +=
            "\n      transform: scaleX(" +
            keys[k][4][0] / 100 +
            ") scaleY(" +
            keys[k][4][1] / 100 +
            ");";
        }
        if (keys[k][3] === props[1][0]) {
          cssText += "\n      transform: rotate(" + keys[k][4] + "deg);";
        }
        if (keys[k][3] === props[2][0]) {
          cssText +=
            "\n      transform: translateX(" +
            Math.round(keys[k][4] - anchorToComp[0]) +
            "px);";
        }
        if (keys[k][3] === props[3][0]) {
          cssText +=
            "\n      transform: translateY(" +
            Math.round(keys[k][4] - anchorToComp[1]) +
            "px);";
        }
        if (keys[k][3] === props[4][0]) {
          cssText += "\n      opacity: " + Math.round(keys[k][4]) / 100 + ";";
        }

        cssText +=
          "\n      animation-timing-function: cubic-bezier" +
          keys[k][2] +
          ";\n   }\n   " +
          pert +
          "% {";

        if (pert === 100) {
          if (keys[k][3] === props[0][0]) {
            cssText +=
              "\n      transform: scaleX(" +
              keys[k][5][0] / 100 +
              ") scaleY(" +
              keys[k][5][1] / 100 +
              ");";
          }
          if (keys[k][3] === props[1][0]) {
            cssText += "\n      transform: rotate(" + keys[k][5] + "deg);";
          }
          if (keys[k][3] === props[2][0]) {
            cssText +=
              "\n      transform: translateX(" +
              Math.round(keys[k][5] - anchorToComp[0]) +
              "px);";
          }
          if (keys[k][3] === props[3][0]) {
            cssText +=
              "\n      transform: translateY(" +
              Math.round(keys[k][5] - anchorToComp[1]) +
              "px);";
          }
          if (keys[k][3] === props[4][0]) {
            cssText += "\n      opacity: " + Math.round(keys[k][5]) / 100 + ";";
          }
          cssText += "\n   }";
        }
      }
      cssText +=
        "\n}\n\n#" +
        layerPropName +
        " {\n   animation: " +
        animName +
        " 1s infinite;\n}\n\n";
    }

    cssText +=
      "." +
      layerName +
      " {\n   transform-origin: " +
      anchorToComp[0] +
      "px " +
      anchorToComp[1] +
      "px;\n}\n\n";
  }

  cssText = cssText.replace(/NaN/g, "0");
  return cssText;
};

function getValue(input) {
  if (typeof input === "number") {
    return input;
  } else if (input instanceof Array && input.length === 2) {
    var x = input[0];
    var y = input[1];
    var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    return r;
  } else if (input instanceof Array && input.length === 3) {
    var x = input[0];
    var y = input[1];
    var z = input[2];
    var r = Math.pow(Math.pow(x, 3) + Math.pow(y, 3) + Math.pow(z, 3), 1 / 3);
    return r;
  }
}

function formatCubic(n: number) {
  if (n < 0.005 && n > -0.005) n = 0;
  return n.toFixed(2);
}
