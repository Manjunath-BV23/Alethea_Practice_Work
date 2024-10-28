import React, { useCallback, useEffect, useMemo, useState } from "react";
import AutomationLayout from "./Layout";
import ScriptTable from "./tables/scripttable";
import { useDispatch, useSelector } from "react-redux";
import {
  Diagram3,
  Globe,
  Robot,
  RocketTakeoff,
  ShieldLock,
  Router,
  Boxes,
  Wifi,
} from "react-bootstrap-icons";
import LiveLogs from "./LiveLogs";
import { setSelectedTestCase, setTestCases } from "../../store/actions/action";
import ReportsTable from "./tables/reportTable";
import axios from "axios";
import TestPack from "./test_selection/TestSelection";
import GridView from "../../common_components/dashboard/GridView";
import CardLayout from "../../common_components/CardLayout";
import Summary from "../../common_components/dashboard/Summary";
import BssidChart from "./charts/BssidChart";
import SummaryTable from "../../common_components/tables/SummaryTable";
import ATFTableView from "../../common_components/tables/ATFSummaryTableView";
import { RebuildDevice } from "../../common_components/Modals";
import { FetchApi } from "../../utilities/utilities";
import IotDevices from "../../common_components/dashboard/IotDevices";
import AP_GridView from "../../common_components/dashboard/AP_GridView";
import AP_TableView from "../../common_components/tables/Ap_TableView";

export default function AutomationDashboard() {
  const dispatch = useDispatch();
  const [TestDetail, setTestDetail] = useState([]);
  const [testPack, setTestPack] = useState({ index: 0, name: "" });
  const [showReport, setShowReport] = useState(true);
  const [showTestConfiguration, setshowTestConfiguration] = useState(false);
  const [showLiveLog, setShowLiveLog] = useState(true);
  const [showGridView, setShowGridView] = useState(true);
  const RhType = useSelector((state) => state.cardType.RH);
  const [btnDisable, setBtnDisable] = useState(false);
  const [showRebuildDeviceAlert, setShowRebuildDeviceAlert] = useState(false);
  const activeCard = useSelector((state) => state.activeCard.card);
  const isTestCaseRunning = useSelector((state) => state.isTestCaseRunning);
  const selectedTestcase = useSelector((state) => state.getSelectedTestCase);
  const [TestCaseCount, setTestCaseCount] = useState({});
  const [showIotTab, setShowIotTab] = useState(false);
  const [showIotDevice, setshowIotDevice] = useState(false);
  const [IotDeviceList, setIotDeviceList] = useState([]);
  const product = useSelector((state) => state.productDetails.atfType);
  const cardType = useSelector((state) => state.cardType.RH);

  const backgroundColor = [
    "bg-primary ",
    "bg-warning",
    "bg-danger",
    "bg-success",
    "bg-info",
    "bg-secondary",
  ];

  const fetchIotDevices = () => {
    try {
      FetchApi("/api/get_iot_devices", {
        ip: product === "ATF" ? "localhost" : "192.168.100.11",
        path: "/api/template",
      })
        .then((response) => response.json())
        .then((output) => {
          if (output?.length > 0) {
            setShowIotTab(true);
            setIotDeviceList(output);
          } else {
            setShowIotTab(false);
            setIotDeviceList([]);
          }
        })
        .catch((e) => {
          setShowIotTab(false);
          setIotDeviceList([]);
          console.log(e);
        });
    } catch (error) {
      setShowIotTab(false);
      setIotDeviceList([]);
      console.log(error);
    }
  };

  useEffect(() => {
    let id = null;

    if (cardType === "ATF") {
      fetchIotDevices();
      setShowIotTab(true);
      if (showGridView) {
        id = setInterval(fetchIotDevices, 2000);
      }
    } else {
      clearInterval(id);
      setShowIotTab(false);
      setshowIotDevice(false);
    }

    return () => {
      clearInterval(id);
    };
  }, [product, cardType, showGridView]);

  const getTestCaseCount = useCallback(
    async (categoryName) => {
      try {
        const response = await FetchApi("/api/command", {
          command: `get_test_suite_info -c ${categoryName}`,
        });
        const result = await response.json();

        let TestDetail = result.data.map((i) => i.name);

        let total_selected = [];
        TestDetail.forEach((i) =>
          selectedTestcase[i] && selectedTestcase[i].isSelected === true
            ? total_selected.push(i)
            : null
        );

        setTestCaseCount((prev) => ({
          ...prev,
          [categoryName]: {
            totalTest: TestDetail.length,
            selected: total_selected.length,
          },
        }));
      } catch (err) {
        console.log(err.message);
      }
    },
    [selectedTestcase]
  );

  const getTestCategoryByLicense = async () => {
    let testCategory = [];
    try {
      const response = await FetchApi("/api/command", {
        command: `get_license_info -testsuite`,
      });

      const result = await response.json();

      testCategory = result
        .filter((i) => i.status === "enabled")
        .map((i) => i.command);
    } catch (err) {
      console.error("Failed to fetch test categories:", err.message);
    }

    return testCategory;
  };

  useEffect(() => {
    axios
      .get("/getTestPackConfig")
      .then((response) => {
        const data = response.data;
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
      })
      .catch((err) => {
        console.error("Error fetching test pack config:", err.message);
      });

    // Fetch Test Pack and Filter Categories
    axios
      .get("/api/getTestPack")
      .then(async (response) => {
        if (response.data) {
          response.data.isOpen = true;

          let categoryByLicense = await getTestCategoryByLicense();
          let getCategory = response.data;

          if (getCategory.children && getCategory.children.length > 0) {
            let filterCategory = getCategory.children.filter((i) =>
              categoryByLicense.includes(i.name)
            );

            response.data.children = filterCategory;
          }

          dispatch(setTestCases(response.data));
          setTestDetail(response.data.children || []);
          setTestPack({
            index: 0,
            name: response.data.children?.[0]?.name || "",
          });
          console.log(response.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching test pack:", err.message);
      });

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    TestDetail.map(async (i) => {
      await getTestCaseCount(i.name);
    });
  }, [TestDetail, selectedTestcase]);

  const rebuildDeviceList = () => {
    setBtnDisable(true);
    FetchApi("/api/clear_all_atf_files", {
      card_no: activeCard,
    })
      .then((res) => res.text())
      .then((result) => {
        setShowRebuildDeviceAlert(false);
        if (result.trim() === "PASS") {
          FetchApi("/api/atf_command", {
            command: `{ "msgType": "rebuildDeviceList","ATFALId": ${activeCard}}`,
          })
            .then((res) => res.json())
            .then((result) => {
              setBtnDisable(false);
            });
        }
      });
  };

  const IconWrapper = (name) => {
    switch (name) {
      case "Application_Performance":
        return <RocketTakeoff />;

      case "Mesh":
        return <Diagram3 />;

      case "Roaming":
        return <Globe />;

      case "Scale":
        return <Boxes />;

      case "Security":
        return <ShieldLock />;

      case "Stress_and_Stability":
        return <Router />;

      case "WiFi_Performance":
        return <Wifi />;

      default:
        return <Robot />;
    }
  };

  const reportsTable = useMemo(() => <ReportsTable />, []);
  const scriptTable = useMemo(() => <ScriptTable />, []);
  const liveLogs = useMemo(() => <LiveLogs />, []);
  const summary = useMemo(() => <Summary testMode={true} />, []);
  const iotDevices = useMemo(
    () => <IotDevices devices={IotDeviceList} />,
    [IotDeviceList]
  );
  const gridView = useMemo(() => {
    return cardType === "AP" ? (
      <AP_GridView />
    ) : (
      <GridView showChart={true} devices={IotDeviceList} />
    );
  }, [showIotDevice, IotDeviceList, cardType]);

  const atfTableView = useMemo(
    () => <ATFTableView devices={IotDeviceList} />,
    [IotDeviceList]
  );
  const summaryTable = useMemo(() => {
    return cardType === "AP" ? <AP_TableView /> : <SummaryTable />;
  }, [cardType]);
  const handleCloseTest = useCallback(() => {
    setshowTestConfiguration(false);
  }, [setshowTestConfiguration]);
  return (
    <AutomationLayout>
      <div>
        <div className="row mt-1 g-2">
          {TestDetail &&
            TestDetail.map((test, i) => {
              return (
                <div className="col" key={test.name}>
                  <div
                    onClick={() => {
                      setTestPack({ index: i, name: test.name });
                      setshowTestConfiguration(true);
                    }}
                    className={`card test-card shadow text-white mb-4 ${
                      backgroundColor[i % 6]
                    }`}
                  >
                    <div className="card-header  d-flex ">
                      <div className="flex-grow-1 ">
                        {IconWrapper(test.name)}
                      </div>
                      <div className="">
                        {TestCaseCount[test.name]
                          ? TestCaseCount[test.name].selected
                          : 0}
                        /
                        {TestCaseCount[test.name]
                          ? TestCaseCount[test.name].totalTest
                          : 0}
                      </div>
                    </div>
                    <div className="card-body" style={{ height: 60 }}>
                      <small className="m-0">
                        {test.name.split("_").join(" ")}
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="row g-1">
          <div
            className="col-lg-4 col-md-5 col-sm-12 border rounded card shadow"
            style={{ padding: "0px" }}
          >
            <div className="test_table border-bottom rounded shadow-sm">
              {scriptTable}
            </div>
            <div className="test_table mt-1">{reportsTable}</div>
          </div>
          <div className="col-lg-5 col-md-7 col-sm-12 border shadow rounded card shadow">
            <CardLayout>
              {(props) => (
                <div>
                  {props.summaryTab ? (
                    summary
                  ) : (
                    <div>
                      {showIotTab ? (
                        <div className="tab-content mb-2">
                          <ul
                            className="nav nav-tabs nav-wrapper-success"
                            role="tablist"
                          >
                            <li className="nav-item" role="presentation">
                              <button
                                className={
                                  !showIotDevice
                                    ? "nav-link active"
                                    : "nav-link"
                                }
                                onClick={() => setshowIotDevice(false)}
                              >
                                All Devices
                              </button>
                            </li>
                            <li className="nav-item" role="presentation">
                              <button
                                className={
                                  showIotDevice ? "nav-link active" : "nav-link"
                                }
                                onClick={() => {
                                  setshowIotDevice(true);
                                  setShowGridView(true);
                                }}
                              >
                                IOT Devices
                              </button>
                            </li>
                          </ul>
                        </div>
                      ) : null}
                      <ul className="nav nav-pills mb-2">
                        {!showIotDevice ? (
                          <>
                            <li className="nav-item">
                              <button
                                data-bs-toggle="tab"
                                className={
                                  showGridView ? "nav-link active" : "nav-link"
                                }
                                type="button"
                                role="tab"
                                onClick={() => setShowGridView(true)}
                              >
                                Grid View
                              </button>
                            </li>
                            <li className="nav-item">
                              <button
                                data-bs-toggle="tab"
                                className={
                                  !showGridView ? "nav-link active" : "nav-link"
                                }
                                type="button"
                                role="tab"
                                onClick={() => setShowGridView(false)}
                              >
                                Table View
                              </button>
                            </li>{" "}
                          </>
                        ) : null}
                        {showGridView && RhType === "ATF" ? (
                          <div className="ms-auto ">
                            <button
                              className="btn btn-primary me-3 "
                              onClick={(e) => setShowRebuildDeviceAlert(true)}
                              disabled={btnDisable || isTestCaseRunning}
                            >
                              {btnDisable
                                ? "Rebuilding..."
                                : "Rebuild Device List"}
                            </button>
                          </div>
                        ) : null}
                      </ul>

                      {showGridView ? (
                        <div>
                          {showIotDevice && showIotTab ? iotDevices : gridView}
                        </div>
                      ) : RhType === "ATF" ? (
                        atfTableView
                      ) : (
                        summaryTable
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardLayout>
            <BssidChart />
          </div>

          <div
            className="col-lg-3 col-md-6 col-sm-12 border shadow card rounded"
            style={{ padding: "0px" }}
          >
            {liveLogs}
          </div>
        </div>

        <TestPack
          categoryName={testPack.name}
          show={showTestConfiguration}
          close={handleCloseTest}
        />
      </div>

      <RebuildDevice
        onClose={() => {
          setShowRebuildDeviceAlert(false);
        }}
        show={showRebuildDeviceAlert}
        rebuild={rebuildDeviceList}
      />
    </AutomationLayout>
  );
}
