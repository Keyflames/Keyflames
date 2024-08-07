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
  return (
    extractPaths() +
    `<style>\n${scanTransformToCSS()}\n${scanPathsToCSS()}</style></svg>`
  );
};

export const scanPathsToCSS = () => {
  var comp = getActiveComp();

  var selected = comp.selectedLayers;
  var cssText = "";

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

    //@ts-ignore
    for (var i = selectedGroups.numProperties; i >= 1; i--) {
      //@ts-ignore
      var localPos = selectedGroups(i)("ADBE Vector Transform Group")(
        "ADBE Vector Position"
      ).value;
      //@ts-ignore
      var localProp = selectedGroups(i)("ADBE Vectors Group");
      var groupPath = "";

      var keysGlobal: any = [];
      var keysLocal: any = [];

      for (var j = 1; j <= localProp.numProperties; j++) {
        var propName = localProp(j).matchName;
        if (propName === "ADBE Vector Shape - Group") {
          var localPathKeys = localProp(j).path.numKeys;
          if (localPathKeys > 0) {
            var prop = localProp(j).path;

            for (var k = 0; k < localPathKeys - 1; k++) {
              //@ts-ignore
              var keyOut = prop.keyOutTemporalEase(k + 1);
              //@ts-ignore
              var keyIn = prop.keyInTemporalEase(k + 2);

              var vel1 = [keyOut][0][0].speed;
              var vel2 = [keyIn][0][0].speed;
              var a = [keyOut][0][0].influence / 100;
              var c = 1 - [keyIn][0][0].influence / 100;

              //@ts-ignore
              var t1 = prop.keyTime(k + 1);
              //@ts-ignore
              var t2 = prop.keyTime(k + 2);

              //@ts-ignore
              var v1Base = prop.keyValue(k + 1);
              //@ts-ignore
              var v2Base = prop.keyValue(k + 2);

              var vert1 = roundAndSumRow(
                v1Base.vertices,
                layerPos[0] + localPos[0],
                layerPos[1] + localPos[1]
              );

              var ins1 = roundAndSumPair(v1Base.inTangents, 0, 0);
              var outs1 = roundAndSumPair(v1Base.outTangents, 0, 0);

              var vert2 = roundAndSumRow(
                v2Base.vertices,
                layerPos[0] + localPos[0],
                layerPos[1] + localPos[1]
              );
              var ins2 = roundAndSumPair(v2Base.inTangents, 0, 0);
              var outs2 = roundAndSumPair(v2Base.outTangents, 0, 0);

              var b = a * vel1; // * dif;
              var d = 1 - (1 - c) * vel2; // * dif;

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
                `${layerName}-path-${i + 1}`,
                convertPointsToSVGPath(vert1, ins1, outs1, v1Base.closed),
                convertPointsToSVGPath(vert2, ins2, outs2, v2Base.closed),
              ]);
            }
            keysGlobal.push(keysLocal);
            keysLocal = [];
          }
        }
      }

      // Generate CSS from keysGlobal
      for (var l = 0; l < keysGlobal.length; l++) {
        var keys = keysGlobal[l];
        var animName = `anim-${layerName}-path-${i}`;
        cssText += `@keyframes ${animName} {\n 0% {`;

        for (var k = 0; k < keys.length; k++) {
          var pert = Math.round(
            (100 * keys[k][1]) / (keys[keys.length - 1][1] - keys[0][0])
          );

          cssText += `  \n    d: path("${keys[k][4]}");\n`;
          cssText += `    animation-timing-function: cubic-bezier${keys[k][2]};\n  }\n ${pert}% {`;

          if (pert === 100) {
            cssText += `  \n    d: path("${keys[k][5]}");\n  }\n`;
          }
        }

        cssText += `}\n\n#${layerName}-path-${i} {\n  animation: ${animName} 1s infinite;\n}\n\n`;
      }
    }
  }

  cssText = cssText.replace(/NaN/g, "0");
  return cssText;
};

export const extractPaths = () => {
  var comp = getActiveComp();
  var svgCode =
    '<svg id="keyflames" viewBox="0 0 ' +
    comp.width +
    " " +
    comp.height +
    '" enable-background="new 0 0 ' +
    comp.width +
    " " +
    comp.height +
    '">';

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

    comp.time = 0;

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

    //@ts-ignore
    for (var i = selectedGroups.numProperties; i >= 1; i--) {
      //@ts-ignore
      var localPos = selectedGroups(i)("ADBE Vector Transform Group")(
        "ADBE Vector Position"
      ).value;
      //@ts-ignore
      var localProp = selectedGroups(i)("ADBE Vectors Group");
      var groupFill = "none";
      var groupStrokeColor = "none";
      var groupStrokeWidth = 0;
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

          groupPath +=
            convertPointsToSVGPath(vert, ins, outs, localPath.closed) + " ";
        }
        if (propName === "ADBE Vector Graphic - Fill") {
          var localFill = localProp(j)(4).value;
          groupFill = rgbToHex(
            localFill[0] * 255,
            localFill[1] * 255,
            localFill[2] * 255
          );
        }
        if (propName === "ADBE Vector Graphic - Stroke") {
          var localStrokeColor = localProp(j)(3).value;
          groupStrokeColor = rgbToHex(
            localStrokeColor[0] * 255,
            localStrokeColor[1] * 255,
            localStrokeColor[2] * 255
          );
          groupStrokeWidth = localProp(j)(5).value;
        }
      }
      svgCode += `<path id="${layerName}-path-${i}" fill="${groupFill}" stroke="${groupStrokeColor}" stroke-width="${groupStrokeWidth}px" d="${groupPath}"/>`;
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

function convertPointsToSVGPath(
  points: number[],
  inTangents: number[][],
  outTangents: number[][],
  closed: boolean = true
) {
  let path = "M";

  for (let i = 0; i < points.length; i += 2) {
    const x = points[i];
    const y = points[i + 1];

    if (i !== 0) {
      const prevX = points[i - 2];
      const prevY = points[i - 1];
      const inTangentX = prevX + outTangents[Math.floor(i / 2) - 1][0];
      const inTangentY = prevY + outTangents[Math.floor(i / 2) - 1][1];
      const outTangentX = x + inTangents[Math.floor(i / 2)][0];
      const outTangentY = y + inTangents[Math.floor(i / 2)][1];

      path += ` C${inTangentX},${inTangentY} ${outTangentX},${outTangentY} ${x},${y}`;
    } else {
      path += `${x},${y}`;
    }
  }

  if (closed && points.length > 2) {
    const firstX = points[0];
    const firstY = points[1];
    const lastX = points[points.length - 2];
    const lastY = points[points.length - 1];
    const lastInTangentX = lastX + outTangents[outTangents.length - 1][0];
    const lastInTangentY = lastY + outTangents[outTangents.length - 1][1];
    const firstOutTangentX = firstX + inTangents[0][0];
    const firstOutTangentY = firstY + inTangents[0][1];

    path += ` C${lastInTangentX},${lastInTangentY} ${firstOutTangentX},${firstOutTangentY} ${firstX},${firstY} Z`;
  } else if (closed) {
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

  var comp = getActiveComp();
  var selected = comp.selectedLayers;
  for (var s = 0; s < selected.length; s++) {
    var layerName = selected[s].name;

    const ancX = selected[s].transform.anchorPoint.value[0];
    const ancY = selected[s].transform.anchorPoint.value[1];
    //@ts-ignore
    const anchorToComp = selected[s].sourcePointToComp([ancX, ancY]);

    var keysGlobal = [],
      keysLocal = [];

    for (var i = 0; i < props.length; i++) {
      var prop = selected[s].transform.property(props[i][0]);
      //@ts-ignore
      var keySelection = prop.numKeys;

      if (keySelection > 0) {
        for (var j = 0; j < keySelection - 1; j++) {
          //@ts-ignore
          var keyOut = prop.keyOutTemporalEase(j + 1);
          //@ts-ignore
          var keyIn = prop.keyInTemporalEase(j + 2);

          var vel1 = [keyOut][0][0].speed;
          var vel2 = [keyIn][0][0].speed;
          var a = [keyOut][0][0].influence / 100;
          var c = 1 - [keyIn][0][0].influence / 100;

          //@ts-ignore
          var t1 = prop.keyTime(j + 1);
          //@ts-ignore
          var t2 = prop.keyTime(j + 2);

          //@ts-ignore
          var v1Base = prop.keyValue(j + 1);
          //@ts-ignore
          var v2Base = prop.keyValue(j + 2);

          var v1 = getValue(v1Base);
          var v2 = getValue(v2Base);

          if (v1 === undefined || v2 === undefined)
            throw new Error("something happened");
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
      var propName = "";
      for (var p = 0; p < props.length; p++) {
        if (props[p][0] === keys[0][3]) {
          propName = props[p][1];
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

function getValue(input: any) {
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
