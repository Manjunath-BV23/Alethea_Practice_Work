import axios from "axios";
import React, { useEffect, useState } from "react";
import { Badge } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import { XCircle, FileEarmarkArrowDown } from "react-bootstrap-icons";
import { socket } from "../../../App";
import {
  setIsTestCaseRunning,
  setSelectedTestCase,
} from "../../../store/actions/action";

import { jsPDF } from "jspdf";
import logo from "../../../assets/images/logo.png";
import autoTable from "jspdf-autotable";
import moment from "moment";
import { FetchApi } from "../../../utilities/utilities";



function ScriptTable() {
  const isTestCaseRunning = useSelector((state) => state.isTestCaseRunning);
  const [isRunning, setIsRunning] = useState(false);
  const [totalEstimateTime, setTotalEstimateTime] = useState(false);
  const [disableRemoveButton, setDisableRemoveButton] = useState(false);
  const theme = useSelector((state) => state.useTheme.name);
  const dispatch = useDispatch();
  const [count, setCount] = useState({ Pass: "", Fail: "", Remaining: "" });
  const selectedTest = useSelector((state) => state.getSelectedTestCase);
  const [TableData, setTableData] = useState([]);
  const [isAborting, setIsAborting] = useState(false);
  const [disableCRbutton, setDisableCRbutton] = useState(true);

  useEffect(() => {
    if (selectedTest && Object.values(selectedTest).length !== 0) {
      let tableData = [];
      Object.entries(selectedTest).map(([name, data]) => {
        if (data.isSelected) {
          return tableData.push({
            name: name,
            absPath: data.absPath,
            estimateTime: data.estimateTime,
            status: data.status,
            verdict: data.verdict,
          });
        }
      });
      setTableData(tableData);
    } else {
      setTableData([]);
    }
  }, [selectedTest]);

  useEffect(() => {
    let totalTime = 0;
    let btnStatus = true;

    TableData.forEach((item, ind) => {
      if (item.status === "RUNNING" && document.querySelector(".sc-dmctIk")) {
        document.querySelector(".sc-dmctIk").scrollTop = 32 * ind;
      }
      if (!item.verdict || item.verdict === "NA") {
        totalTime += parseInt(item.estimateTime);
      }
      if (
        item.verdict === "PASS" ||
        item.verdict === "FAIL" ||
        item.status === "ABORTED"
      ) {
        btnStatus = false;
      }
    });
    setTotalEstimateTime(totalTime);
    setDisableCRbutton(btnStatus);
    socket.on("testCaseStatus", (status) => {
      let tableData = [...TableData];

      // eslint-disable-next-line
      tableData.map((row) => {
        if (row.name === status.name) {
          row["status"] = status.status;
          if (status.status === "COMPLETED" || status.status === "FAIL") {
            row["verdict"] = status.verdict;
          } else {
            row["verdict"] = "NA";
          }
        }
        selectedTest[row.name] = {
          isSelected: true,
          absPath: row.absPath,
          estimateTime: row.estimateTime,
          status: row.status,
          verdict: row.verdict,
        };
      });

      setTableData(tableData);
    });

    let passCount = TableData.filter((i) => i.verdict === "PASS").length;
    let failCount = TableData.filter((i) => i.verdict === "FAIL").length;
    let remainingCount = TableData.length - (passCount + failCount);
    setCount({ Pass: passCount, Fail: failCount, Remaining: remainingCount });

    return () => {
      socket.off("testCaseStatus");
    };
    // eslint-disable-next-line
  }, [TableData]);
  const checkStatus = () => {
    FetchApi("/api/command", {
      command: `testpack_status`,
    })
      .then((res) => res.json())
      .then((result) => {
        if (result && result.aborting === "true") {
          setIsAborting(true);
          setTimeout(() => {
            checkStatus();
          }, 2000);
        } else {
          setIsAborting(false);
        }
      });
  };

  useEffect(() => {
    axios.get("/api/getTestPackRunningStatus").then((res) => {
      if (res.data && res.data !== "") {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    });

    socket.on("testPackEnd", (msg) => {
      if (msg.trim() === "PASS") {
        setIsRunning(false);
      }
    });

    checkStatus();

    return () => {
      socket.off("testPackEnd");
    };
  }, []);

  useEffect(() => {
    // enable disable remove testcase button
    setDisableRemoveButton(isRunning);
    dispatch(setIsTestCaseRunning(isRunning));
  }, [isRunning]);

  const SaveConfig = (data) => {
    FetchApi("/saveTestPackConfig", {
      configuration: JSON.stringify(data),
    })
      .then((response) => response.text())
      .then((res) => {
        // console.log(res);
      });
  };

  const updateApi = (data) => {
    if (Object.keys(data).length !== 0) {
      for (const [key, value] of Object.entries(data)) {
        dispatch(
          setSelectedTestCase(
            key,
            value.isSelected,
            value.absPath,
            value.estimateTime,
            value.status,
            value.verdict
          )
        );
      }
    }
  };

  const runStopTestpack = (status) => {
    if (status === "Run") {
      let testCases = TableData.map((i) => i.absPath);
      FetchApi("/runTestPack", { testCases: testCases })
        .then((response) => response.text())
        .then((res) => {
          if (res === "OK") {
            setIsRunning(true);
            let resetTable = JSON.parse(JSON.stringify(TableData));
            resetTable.map((i, index) => {
              resetTable[index]["status"] = "NA";
              resetTable[index]["verdict"] = "NA";
            });

            let resetConfig = JSON.parse(JSON.stringify(selectedTest));
            Object.entries(resetConfig).forEach(
              ([key, value]) =>
                (resetConfig[key] = {
                  ...value,
                  status: "NA",
                  verdict: "NA",
                })
            );

            SaveConfig(resetConfig);
            setTableData(resetTable);
          } else {
          }
        });
    } else {
      FetchApi("/stopTestPack")
        .then((response) => response.text())
        .then((res) => {});
      checkStatus();
    }
  };

  const removeSelectedTest = (name) => {
    let updateData = JSON.parse(JSON.stringify(selectedTest));
    updateData[name].isSelected = false;
    SaveConfig(updateData);
    updateApi(updateData);
  };

  function convertSecondsToReadableString(seconds) {
    seconds = seconds || 0;
    seconds = Number(seconds);
    seconds = Math.abs(seconds);

    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];

    if (d > 0) {
      parts.push(d + "d ");
    }

    if (h > 0) {
      parts.push(h + "h ");
    }

    if (m > 0) {
      parts.push(m + "m ");
    }

    if (s > 0) {
      parts.push(s + "s");
    }

    return parts.join("");
  }

  const COLUMNS = [
    {
      name: "Name",
      selector: (row) => row.name.split("_").join(" "),
      sortable: true,
      width: "18rem",
      wrap: true,
    },
    {
      name: "Status",
      selector: (row) => {
        return row.status === "RUNNING" ? (
          <Badge pill bg="warning">
            {row.status}
          </Badge>
        ) : (
          row.status || "NA"
        );
      },
      sortable: true,
      minWidth: "7rem",
      maxWidth: "9rem",
      wrap: true,
    },
    {
      name: "Verdict",
      selector: (row) => {
        return row.verdict !== "NA" && row.verdict !== undefined ? (
          <Badge pill bg={row.verdict === "PASS" ? "success" : "danger"}>
            {row.verdict}
          </Badge>
        ) : (
          "NA"
        );
      },
      sortable: true,
      minWidth: "6rem",
      maxWidth: "7rem",
    },
    {
      name: "Action",

      selector: (row) => {
        return (
          <button
            type="button"
            className="btn btn-sm btn-link "
            disabled={disableRemoveButton}
            onClick={() => removeSelectedTest(row.name)}
          >
            <XCircle color="red" />
          </button>
        );
      },
      width: "5rem",
    },
  ];

  const exportCampaignReport = () => {
    const doc = new jsPDF("p", "px", "a2");

    const header = function (data) {
      doc.addImage(logo, "JPEG", data.settings.margin.left, 20);
      doc.text(`Campaign Report `, 450, 80, { align: "center" });
      doc.line(30, 90, 860, 90);
      // doc.setFont(`Date: ${moment(Date.now())}`,"normal")
      doc.setFontSize(8);
      doc.setFont(undefined, "normal", "2");
      doc.text(`Date: ${moment(Date.now())}`, 750, 20, "left");
    };

    const tableData = TableData.map((i) => [i.name, i.status, i.verdict]);
    autoTable(doc, {
      head: [["Name", "Status", "Verdict"]],
      body: tableData,
      margin: { top: 160 },
      didDrawPage: header,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 8,
        fontWeight: "normal",
        overflow: "linebreak",
        cellWidth: "auto",
      },
      headStyles: {
        fillColor: "#337ab7",
        textColor: "#fff",
      },
      willDrawCell: function (data) {
        if (data.row.section === "body") {
          if (data.cell.raw === "FAIL") {
            doc.setTextColor(255, 0, 0);
            // doc.setFont({fontStyle: "Bold"})
            // Red
          } else if (data.cell.raw === "PASS") {
            doc.setTextColor(25, 135, 84); // GREEN
            // doc.setFont({fontStyle: "Bold"})
          }
        }
      },
    });

    autoTable(doc, {
      head: [["Total", "Pass", "Fail"]],
      body: [[`${tableData.length}`, `${count.Pass}`, `${count.Fail}`]],
      // margin: {right: 750},
      didDrawPage: header,
      theme: "grid",
      startY: 100,
      showHead: "firstPage",
      styles: {
        overflow: "linebreak",
        fontSize: 10,
        cellPadding: 8,
        fontWeight: "normal",
        overflow: "linebreak",
        cellWidth: "auto",
      },
      headStyles: {
        fillColor: "#337ab7",
        textColor: "#fff",
      },
    });
    doc.save(`CampaignReport.pdf`);
  };

  return (
    <div>
      <div className="row align-items-center my-1 p-1">
        <div className="col-md-3">
          <h6 >Test Scripts</h6>
        </div>
        <div
          className={
            isAborting ? "col-md-3 " : "col-md-4 "
          }
        >
          <div className="d-flex justify-content-end  ">
            <h5>
              <span className="badge bg-success mx-1">{count.Pass}</span>
            </h5>
            <h5>
              <span className="badge bg-danger  mx-1">{count.Fail}</span>
            </h5>

            <h5>
              <span className="badge bg-secondary  mx-1">
                {count.Remaining}
              </span>
            </h5>
            <h5>
              <span className="badge bg-info  mx-1">
                {convertSecondsToReadableString(totalEstimateTime)}
              </span>
            </h5>
          </div>
        </div>

        <div className={isAborting ? "col-md-6" : "col-md-5"}>
          <div className="d-flex justify-content-end  ">
            <button
              className={
                isRunning || isAborting
                  ? "btn btn-danger btn-sm"
                  : "btn btn-success btn-sm"
              }
              onClick={() => runStopTestpack(isRunning ? "Stop" : "Run")}
              disabled={isAborting || TableData.length === 0}
            >
              {isAborting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  &nbsp; Stopping..
                </>
              ) : isRunning ? (
                "Stop"
              ) : (
                "Run"
              )}
            </button>
            <button
              className="btn btn-link btn-sm ms-1 "
              onClick={() => {
                exportCampaignReport();
              }}
              disabled={
                TableData?.length === 0 || isTestCaseRunning || disableCRbutton
              }
            >
              Campaign Report <FileEarmarkArrowDown />{" "}
            </button>
          </div>
        </div>
      </div>
      <div className="border-bottom"></div>
      <DataTable
        columns={COLUMNS}
        data={TableData}
        dense
        fixedHeader
        fixedHeaderScrollHeight="290px"
        theme={theme}
      />
    </div>
  );
}

export default ScriptTable;
