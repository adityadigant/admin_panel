function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var reportCards = document.querySelectorAll('.report-card');
var reportStart = 6; // july

var reportEnd = new Date().getMonth(); // current month

var months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var yellowFill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: {
    argb: 'FFFFFF00'
  }
};
var redFill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: {
    argb: 'FFFF0000'
  }
};
var font = {
  name: 'Arial',
  bold: true
};
var CELL_WIDTH = 8.43;
var COL_WIDTH = 9;
var ROW_HEIGHT = 20;

var init = function init(office, officeId) {
  downloadReport("".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/report?name=monthlyAttendance&month=8&year=2020"));
  reportCards.forEach(function (card) {
    var btn = card.querySelector('.download-report-btn');
    var select = document.getElementById('month-list');

    for (var _i = reportStart; _i <= reportEnd; _i++) {
      select.querySelector('.mdc-list').appendChild(monthList(_i));
    }

    var monthSelect = new mdc.select.MDCSelect(select);
    monthSelect.value = new Date().getMonth().toString();
    btn.addEventListener('click', function (ev) {
      btn.classList.add('in-progress');
      http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/attendance/?name=MTD&month=").concat(monthSelect.value, "&year=2020")).then(function (response) {
        console.log(response);
        Object.keys(response).forEach(function (date) {
          if (moment(date, 'Do MMM YYYY').valueOf() > moment().valueOf()) {
            delete response[date];
          }
        });
        var employees = {};
        var dates = Object.keys(response);

        if (!dates.length) {
          btn.classList.remove('in-progress');
          document.getElementById('report-error').textContent = 'No check-ins found';
          return;
        }

        document.getElementById('report-error').textContent = '';
        var workbook = new ExcelJS.Workbook();
        workbook.creator = 'Growthfile Analytics Pvt Ltd.';
        workbook.created = new Date();
        var sheet = workbook.addWorksheet('Attendance Report', {
          views: [{
            showGridLines: true
          }]
        });
        /** set cell properties like width,height & font */

        sheet.properties.defaultColWidth = COL_WIDTH;
        sheet.properties.defaultRowHeight = ROW_HEIGHT;
        sheet.mergeCells('A1:B1');
        sheet.getCell('A1').value = 'ATTENDANCE ' + moment(Number(monthSelect.value) + 1, 'MM').format('MMM') + ' 2020';
        sheet.getCell('A1').alignment = {
          horizontal: 'center'
        };
        /** start cell filling operation */

        var startRowIndex = 3;
        var endRowIndex = 5;
        var subHeaders = [];
        dates.forEach(function (date, index) {
          response[date].forEach(function (employeeData) {
            if (employees[employeeData.phoneNumber]) {
              employees[employeeData.phoneNumber].dates.push(_extends(employeeData, {
                date: date
              }));

              if (employeeData.startTime || employeeData.endTime) {
                employees[employeeData.phoneNumber].totalDaysWorked++;
              }
            } else {
              employees[employeeData.phoneNumber] = {
                employeeName: employeeData['employeeName'],
                totalDays: dates.length,
                totalDaysWorked: 0,
                dates: [_extends(employeeData, {
                  date: date
                })]
              };

              if (employeeData.startTime || employeeData.endTime) {
                employees[employeeData.phoneNumber].totalDaysWorked = 1;
              }
            }
          });

          try {
            sheet.mergeCells(1, startRowIndex, 1, endRowIndex);
            sheet.getRow(1).getCell(startRowIndex).value = date;
            subHeaders.push('start time', 'end time', 'hours');
            startRowIndex = endRowIndex + 1;
            endRowIndex += 3;
          } catch (e) {
            console.log(e);
          }
        });
        subHeaders.push('TOTAL DAYS', 'DAYS WORKED');
        var newHead = sheet.addRow(['EMP NAME', 'MOBILE NO'].concat(subHeaders));
        newHead.alignment = {
          horizontal: 'center'
        };
        Object.keys(employees).forEach(function (phoneNumber) {
          var dateRangeArr = [];
          var item = employees[phoneNumber];
          item.dates.forEach(function (date) {
            var diff = null;

            if (date.endTime && date.startTime) {
              diff = moment.utc(moment(date.endTime || '00', 'HH:mm').diff(moment(date.startTime, 'HH:mm'))).format('HH:mm');
            } // console.log(moment.utc(moment(date.endTime || '00','HH:mm').diff(moment(date.startTime,'HH:mm'))).format('HH:mm'))


            dateRangeArr.push(date.startTime, date.endTime, diff);
          });
          dateRangeArr.push(item.totalDays, item.totalDaysWorked);
          var newRow = sheet.addRow([item.employeeName, phoneNumber].concat(dateRangeArr));
          newRow.alignment = {
            horizontal: 'center'
          }; // start with first date  cell and find hour value
          // if hours are not found mark date as absent
          // if hours are less than 8 mark date as invalid (user didn't completed 8 hours)

          for (i = 5; i < newRow.cellCount; i += 3) {
            var hourCell = newRow.getCell(i);
            var endTimeCell = newRow.getCell(i - 1);
            var startTimeCell = newRow.getCell(i - 2);

            if (newRow.getCell(i).value == null || newRow.getCell(i).value == undefined) {
              sheet.mergeCells(newRow.getCell(i - 2).address, newRow.getCell(i).address);
              hourCell.fill = redFill;
              endTimeCell.fill = redFill;
              startTimeCell.fill = redFill;
              startTimeCell.value = 'ABSENT';
            } else if (moment(newRow.getCell(i).value, 'HH:mm').hour() < 8) {
              hourCell.fill = yellowFill;
              endTimeCell.fill = yellowFill;
              startTimeCell.fill = yellowFill;
            }
          }
        });
        sheet.getColumn(1).width = 15;
        sheet.getColumn(2).width = 15;
        sheet.getColumn(sheet.columnCount).width = 15;
        sheet.getColumn(sheet.columnCount - 1).width = 15;
        sheet.getRow(1).font = font;
        sheet.getRow(1).alignment = {
          horizontal: 'center'
        };
        sheet.getColumn(1).font = font;
        sheet.getRow(2).font = font;
        sheet.getColumn(2).font = font;
        /** Download workbook */

        workbook.xlsx.writeBuffer().then(function (data) {
          var blob = new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          });
          var url = window.URL.createObjectURL(blob);
          var anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = moment().format('Do MMM YYYY') + '.xlsx';
          anchor.click();
          window.URL.revokeObjectURL(url);
          btn.classList.remove('in-progress');
        });
      });
    });
  });
};

var downloadReport = function downloadReport(url) {
  firebase.auth().currentUser.getIdToken().then(function (token) {
    fetch(url, {
      method: 'GET',
      headers: new Headers({
        "Authorization": "Bearer ".concat(token)
      })
    }).then(function (response) {
      console.log(response.status);
      return response.blob();
    }).then(function (blob) {
      console.log(blob);
      window.open(window.URL.createObjectURL(blob));
      return;
      var file = window.URL.createObjectURL(blob); // window.location.assign(file);
      // return

      var a = document.createElement('a');
      a.href = file;
      a.download = "filename.xlsx";
      document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox

      a.click();
      a.remove();
    }).catch(console.error);
  });
};

var monthList = function monthList(month) {
  var el = createElement('li', {
    className: 'mdc-list-item'
  });
  el.dataset.value = month;
  el.innerHTML = "<span class = \"mdc-list-item__ripple\"></span> \n         <span class = \"mdc-list-item__text\">".concat(months[month], "</span>");
  return el;
};