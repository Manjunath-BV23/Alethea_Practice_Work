import React, { useEffect } from "react";
import { FileEarmarkArrowDown, Trash3 } from "react-bootstrap-icons";
import { socket } from "../../App";
import { FetchApi } from "../../utilities/utilities";

export default function LiveLogs() {
  useEffect(() => {
    FetchApi("/api/read_file_data", {
      file_name: `/var/www/SWAT-WiCheck-GUI/logs/script_logs.txt`,
    })
      .then((response) => response.text())
      .then((output) => {
        document.getElementById("testLogs").innerHTML += output;
        let objDiv = document.getElementById("testLogs");
        objDiv.scrollTop = objDiv.scrollHeight;
      });
    socket.on("liveLogs", (status) => {
      document.getElementById("testLogs").innerHTML += status;
      let objDiv = document.getElementById("testLogs");
      objDiv.scrollTop = objDiv.scrollHeight;
    });

    return () => {
      socket.off("liveLogs");
    };
  }, []);

  const clearLog = () => {
    FetchApi("/api/clear_scripting_log", {
      file_name: `/var/www/SWAT-WiCheck-GUI/logs/script_logs.txt`,
    })
      .then((res) => res.text())
      .then((res) => {
        if (res === "PASS") {
          document.getElementById("testLogs").innerHTML = "";
        }
      });
  };

  const ExportLogFile = () => {
    let element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(document.getElementById("testLogs").innerText)
    );
    element.setAttribute("download", "automation_live_logs.log");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="logs-panel">
      <div className="panel-heading d-flex p-1">
        <h6>Live Logs</h6>
        <button className="btn btn-link btn-sm ms-auto" onClick={ExportLogFile}>
          Export <FileEarmarkArrowDown />{" "}
        </button>
        <button className="btn btn-link btn-sm " onClick={clearLog}>
          Clear <Trash3 />
        </button>
      </div>
      <div className="border-bottom"></div>
      <div className="panel-body test_logs p-3" id="testLogs"></div>
    </div>
  );
}
