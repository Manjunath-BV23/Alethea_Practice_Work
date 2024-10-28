import React, { useMemo } from "react";
import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";

import { useSelector } from "react-redux";
import axios from "axios";
import { ReportClearConfirmation } from "../../../common_components/Modals";
import {
  FileEarmarkArrowDown,
  Trash3,
  XCircle,
  FileEarmarkPdf,
  GraphUpArrow,
} from "react-bootstrap-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { socket } from "../../../App";
import AnomalyLogChart from "../charts/AnomalyLogChart";
import { Spinner } from "react-bootstrap";
import { FetchApi } from "../../../utilities/utilities";

function ReportsTable() {
  const [reportTableData, setReportsTableData] = useState([]);
  const theme = useSelector((state) => state.useTheme.name);
  const [showConfirmation, setshowConfirmation] = useState(false);
  const [showAnomaly, setshowAnomaly] = useState(false);
  const [anomalyDetails, setAnomalyDetails] = useState({ path: "", files: [] });
  const [isLoading, setIsLoading] = useState({});

  const notify = (toastmessage) =>
    toast.success(toastmessage, { position: toast.POSITION.TOP_CENTER });
  const notifyError = (toastmessage) =>
    toast.error(toastmessage, { position: toast.POSITION.TOP_CENTER });
  const exportLogFile = (name) => {
    let testCaseName = name.replace(/ /g, "_");
    window.location.href = `${window.location.origin}/api/exportTestPackLogs/${testCaseName}`;
  };
  const isTestCaseRunning = useSelector((state) => state.isTestCaseRunning);
  const selectedTest = useSelector((state) => state.getSelectedTestCase);
  const [testScriptTableDataInState, setTestScriptTableDataInState] = useState(
    []
  );

  const [pending, setPending] = useState(false);

  const getReports = () => {
    setPending(true);
    FetchApi("/api/command", { command: "get_test_report" })
      .then((res) => res.json())
      .then((res) => {
        let testScriptTableData = res.map((row, index) => {
          return {
            serialNo: index,
            name: row.testcase_name,
            date: row.time,
            logs: row.logs,
            report: row.report,
            anomaly: row.anomaly_detection,
          };
        });
        setReportsTableData(testScriptTableData);
        setPending(false);
      });
  };

  useEffect(() => {
    getReports();
  }, []);

  const clearLog = (name) => {
    let testCaseName = name.replace(/ /g, "_");
    FetchApi("/api/clearTestPackLogs", {
      testCaseName: testCaseName,
    })
      .then((res) => res.text())
      .then((res) => {
        if (res === "PASS") {
          getReports();
        } else {
          notifyError("Failed to clear the log directory");
        }
      });
  };

  useEffect(() => {
    try {
      if (selectedTest && Object.values(selectedTest).length !== 0) {
        let testScriptTableData = [];
        Object.entries(selectedTest).map(([name, data]) => {
          if (data.isSelected) {
            return testScriptTableData.push({
              name: name,
              absPath: data.absPath,
              estimateTime: data.estimateTime,
              status: data.status,
              verdict: data.verdict,
            });
          }
        });
        setTestScriptTableDataInState(testScriptTableData);
      } else {
        setTestScriptTableDataInState([]);
      }
    } catch (error) {
      console.log(error);
    }
  }, [selectedTest]);

  useEffect(() => {
    try {
      socket.on("testCaseStatus", (status) => {
        let testScriptTableData = [...testScriptTableDataInState];
        // eslint-disable-next-line
        testScriptTableData.map((row) => {
          if (row.name === status.name) {
            row["status"] = status.status;
          }
        });
        setTestScriptTableDataInState(testScriptTableData);
      });
    } catch (error) {
      console.log(error);
    }
    return () => {
      socket.off("testCaseStatus");
    };
    // eslint-disable-next-line
  }, [testScriptTableDataInState]);

  useEffect(() => {
    try {
      if (testScriptTableDataInState.length && reportTableData.length) {
        for (let i = 0; i < testScriptTableDataInState.length; i++) {
          const item = testScriptTableDataInState[i];
          for (let j = 0; j < reportTableData.length; j++) {
            const reportItem = reportTableData[j];
            let testCaseName = reportTableData[j].name.replace(/ /g, "_");
            if (item.name === testCaseName) {
              if (item.status === "RUNNING") {
                reportItem["running"] = true;
              } else {
                reportItem["running"] = false;
              }
              break;
            }
          }
        }
        setReportsTableData(reportTableData);
      }
    } catch (error) {
      console.log(error);
    }
  }, [testScriptTableDataInState, reportTableData]);

  const COLUMNS = useMemo(
    () => [
      {
        name: "Name",
        selector: (row) => row.name,
        sortable: true,
        width: "13rem",
        wrap: true,
      },
      {
        name: "Time",
        selector: (row) => row.date,
        sortable: true,
        width: "10rem",
        wrap: true,
      },

      {
        name: "Report",
        selector: (row) =>
          row.report !== "NA" ? (
            <button
              className={`btn bg-warning-subtle btn-sm ${
                row.running ? "btn-link block-btn" : ""
              } `}
              onClick={() => openReport(row.report, row.running)}
              disabled={row?.running}
            >
              <FileEarmarkPdf />
            </button>
          ) : null,
        sortable: false,
        compact: true,
        width: "2.5rem",
        center: true,
      },
      {
        name: "Logs",
        selector: (row) => (
          <button
            className="btn btn-sm bg-success-subtle"
            onClick={() => exportLogFile(row.name)}
          >
            <FileEarmarkArrowDown />
          </button>
        ),
        sortable: false,
        compact: true,
        width: "3rem",
        center: true,
      },
      {
        name: <span>AI Analysis(&beta;)</span>,
        selector: (row) =>
          row.anomaly ? (
            <button
              className={`btn bg-primary-subtle btn-sm ${
                isTestCaseRunning ? "btn-link block-btn" : ""
              } `}
              onClick={() => openAnomaly(row.name)}
              disabled={isTestCaseRunning}
            >
              {isLoading && isLoading[row.name] === true ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                <GraphUpArrow />
              )}
            </button>
          ) : null,
        sortable: false,
        compact: true,
        width: "5rem",
        center: true,
      },
      {
        name: "Clear",
        selector: (row) => {
          return (
            <button
              className={`btn bg-danger-subtle btn-sm ${
                row.running ? "btn-link block-btn" : ""
              } `}
              onClick={() => clearLog(row.name)}
              disabled={row?.running}
            >
              <XCircle />
            </button>
          );
        },
        sortable: false,
        compact: true,
        width: "2rem",
        center: true,
      },
    ],
    [isTestCaseRunning, reportTableData, isLoading]
  );

  const openAnomaly = (name) => {
    setIsLoading({ [name]: true });
    let testCaseName = name.replace(/ /g, "_");
    FetchApi("/api/command", {
      command: `ai_log_analyzer --tc_name ${testCaseName}`,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "PASS") {
          FetchApi("/api/get_anomaly_files", { testCaseName: testCaseName })
            .then((res) => res.json())
            .then((result) => {
              setIsLoading({});
              if (result !== "FAIL" && result.length) {
                setshowAnomaly(true);
                setAnomalyDetails({
                  path: `/home/test/test_logs/${testCaseName}/`,
                  files: result,
                });
              }
            });
        } else {
          setIsLoading({});
          notifyError(res.reason);
        }
      });
  };

  const openReport = (path, isRunning) => {
    if (!isRunning) {
      window.open(
        window.location.origin + path,
        "",
        "height=auto,width=auto,scrollbars=yes, resizable=yes"
      );
    }
  };

  const exportZipFile = () => {
    window.location.href = `/api/exportAllTestCaselogs`;
  };
  const clearReport = () => {
    axios.get("/api/clearAllTestPackLogs").then((res) => {
      setshowConfirmation(false);
      if (res.data.trim() === "PASS") {
        notify("Report Cleared Successfully !");
        getReports();
      }
    });
  };

  return (
    <div className="border-top rounded">
      <div className="row align-items-center my-1 p-1">
        <div className="col-md-6">
          <div className="float-start">
            <h6>Reports</h6>
          </div>
        </div>
        <div className="col-md-6">
          <div className="float-end ">
            <button
              className="btn btn-primary btn-sm m-1"
              onClick={exportZipFile}
              disabled={!reportTableData.length}
            >
              <FileEarmarkArrowDown /> Export All
            </button>
            <button
              className="btn btn-danger btn-sm m-1"
              onClick={() => setshowConfirmation(true)}
              disabled={!reportTableData.length}
            >
              <Trash3 /> Clear All
            </button>
          </div>
        </div>
      </div>
      <div className="border-bottom"></div>
      <DataTable
        columns={COLUMNS}
        data={reportTableData}
        fixedHeader
        fixedHeaderScrollHeight="290px"
        theme={theme}
        progressPending={pending}
        progressComponent={<Spinner animation="border" />}
      />

      <ReportClearConfirmation
        clearReport={clearReport}
        onClose={() => setshowConfirmation(false)}
        show={showConfirmation}
      />

      <AnomalyLogChart
        files={anomalyDetails.files}
        path={anomalyDetails.path}
        show={showAnomaly}
        close={() => {
          setshowAnomaly(false);
        }}
      />
    </div>
  );
}

export default ReportsTable;
