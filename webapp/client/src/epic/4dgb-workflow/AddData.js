import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Col, Row, Form, Button } from 'reactstrap';
import ProjectSummary from '../../Common/Results/ProjectSummary';
import { LoaderDialog } from "../../../common/Dialogs";
import { postData, notify } from '../../../common/util';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { workflowlist, initial4DGB } from './Defaults';
import { Project } from '../../Common/Forms/Project';
import { Tracks } from './forms/Tracks';
import { Annotations } from './forms/Annotations';
import { Bookmarks } from './forms/Bookmarks';

const queryString = require('query-string');

function AddData(props) {
    const [code, setCode] = useState();
    const [project, setProject] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();

    const user = useSelector(state => state.user);
    const [allowUpdate, setAllowUpdate] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [requestSubmit, setRequestSubmit] = useState(false);

    const [doValidation, setDoValidation] = useState(0);

    const [workflow, setWorkflow] = useState('adddata');

    const [modules, setModules] = useState({
        'tracks': { ...initial4DGB['tracks'].defaults },
        'annotations': { ...initial4DGB['annotations'].defaults },
        'bookmarks': { ...initial4DGB['bookmarks'].defaults },
    });

    //componentDidMount()
    useEffect(() => {
        const parsed = queryString.parse(props.location.search);
        if (parsed.code) {
            setCode(parsed.code);
        } else {
            props.history.push("/user/projectlist");
        }
    }, [user, props]);

    useEffect(() => {
        function getProjectInfo() {
            let url = "/auth-api/user/project/info";
            const projData = {
                code: code,
            };
            postData(url, projData)
                .then(data => {
                    if (data.owner === user.profile.email || data.sharedto.includes(user.profile.email)) {
                        setAllowUpdate(true);
                    } else {
                        setAllowUpdate(false);
                    }
                    setProject(data);
                    setLoading(false)
                })
                .catch(err => {
                    setError(err);
                    setLoading(false)
                });
        }
        if (code) {
            setLoading(true);
            getProjectInfo();
        }
    }, [code]);


    const setModuleParams = (params, workflowName) => {
        //console.log("module:", params, workflowName)
        setModules({ ...modules, [workflowName]: params });
        setDoValidation(doValidation + 1);
    }

    //submit button clicked
    const onSubmit = () => {

        let formData = new FormData();

        formData.append('pipeline', workflowlist[workflow].title);
        formData.append('project', JSON.stringify({ name: project.name, desc: project.desc }));

        let inputDisplay = {};
        inputDisplay.workflow = workflowlist[workflow].title;
        inputDisplay.project = { name: project.name, desc: project.desc };
        let myWorkflow = {};
        myWorkflow.name = workflow;
        myWorkflow.project = project.code;
        //tracks
        if (modules['tracks'].paramsOn && modules['tracks'].tracks.length > 0) {
            myWorkflow.tracks = [];
            inputDisplay['tracks'] = [];
            modules['tracks'].tracks.forEach(track => {
                let item = {
                    name: track.trackName, file: track.trackData,
                    columns: [{ name: track.columnName1 }, { name: track.columnName2 }]
                };
                if (track.columnData1) {
                    item.columns[0].file = track.columnData1;
                }
                if (track.columnData2) {
                    item.columns[1].file = track.columnData2;
                }
                myWorkflow.tracks.push(item);
                let itemDisplay = {
                    name: track.trackName, file: track.trackDataDisplay,
                    columns: [{ name: track.columnName1 }, { name: track.columnName2 }]
                };
                if (track.columnDataDisplay1) {
                    itemDisplay.columns[0].file = track.columnDataDisplay1;
                }
                if (track.columnDataDisplay2) {
                    itemDisplay.columns[1].file = track.columnDataDisplay2;
                }
                inputDisplay['tracks'].push(itemDisplay);
            });
        }
        //annotations
        if (modules['annotations'].paramsOn && (modules['annotations'].genesFile || modules['annotations'].featuresFile)) {
            myWorkflow.annotations = {};
            inputDisplay['annotations'] = {};
            if (modules['annotations'].genesFile) {
                myWorkflow.annotations.genes = {
                    file: modules['annotations'].genesFile, description: modules['annotations'].genesDescription
                };
                inputDisplay['annotations'].genes = {
                    file: modules['annotations'].genesFileDisplay, description: modules['annotations'].genesDescription
                };
            }
            if (modules['annotations'].featuresFile) {
                myWorkflow.annotations.features = {
                    file: modules['annotations'].featuresFile, description: modules['annotations'].featuresDescription
                };
                inputDisplay['annotations'].features = {
                    file: modules['annotations'].featuresFileDisplay, description: modules['annotations'].featuresDescription
                };
            }
        }
        //bookmarks
        if (modules['bookmarks'].paramsOn && (modules['bookmarks'].locations.length > 0 || modules['bookmarks'].features.length > 0)) {
            myWorkflow.bookmarks = {};
            inputDisplay['bookmarks'] = {};
            if (modules['bookmarks'].locations.length > 0) {
                myWorkflow.bookmarks.locations = [];
                inputDisplay['bookmarks'].locations = [];
                modules['bookmarks'].locations.forEach(loc => {
                    myWorkflow.bookmarks.locations.push([loc.start, loc.end]);
                    inputDisplay['bookmarks'].locations.push([loc.start, loc.end]);
                })
            }
            if (modules['bookmarks'].features.length > 0) {
                myWorkflow.bookmarks.features = [];
                inputDisplay['bookmarks'].features = [];
                modules['bookmarks'].features.forEach(feature => {
                    myWorkflow.bookmarks.features.push(feature.input);
                    inputDisplay['bookmarks'].features.push(feature.input);
                })
            }
        }

        formData.append('workflow', JSON.stringify(myWorkflow));
        formData.append('inputDisplay', JSON.stringify(inputDisplay));

        postData("/auth-api/user/project/add", formData)
            .then(data => {
                notify("success", "Your workflow request was submitted successfully!", 2000);
                setTimeout(() => props.history.push("/user/projectlist"), 2000);
            }
            ).catch(error => {
                setSubmitting(false);
                alert(error);
            });
    }

    useEffect(() => {
        setRequestSubmit(true);

        Object.keys(modules).forEach((item, index) => {
            if (modules[item] && modules[item].paramsOn && !modules[item].validForm) {
                setRequestSubmit(false);
            }
        });
        //no data
        if (modules['tracks'].tracks.length === 0 && !modules['annotations'].genesFile && !modules['annotations'].featuresFile &&
            modules['bookmarks'].locations.length === 0 && modules['bookmarks'].features.length === 0) {
            setRequestSubmit(false);
        }

    }, [doValidation]);// eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="animated fadeIn">
            <LoaderDialog loading={loading} text="Loading..." />
            {(error || !allowUpdate) ?
                <Row className="justify-content-center">
                    <Col xs="12" md="10">
                        <div className="clearfix">
                            <h4 className="pt-3">Project not found</h4>
                            <hr />
                            <p className="text-muted float-left">
                                The project might be deleted or you have no permission to acces or update it.
                                <br></br>
                                {error}
                            </p>
                        </div>
                    </Col>
                </Row>
                :
                <>
                    {project &&
                        <ProjectSummary project={project} />
                    }
                    <br></br>
                    <Row className="justify-content-center">
                        <Col xs="12" md="10">
                            <ToastContainer />
                            <LoaderDialog loading={submitting === true} text="Submitting..." />

                            <h4 className="pt-3">Add New Data</h4>
                            <Form onSubmit={e => { e.preventDefault(); }}>
                                <div className="clearfix">

                                    {initial4DGB['tracks'].process.on &&
                                        <Tracks title={initial4DGB['tracks'].process.full_name} name={'tracks'} workflow={workflow}
                                            isValid={modules['tracks'].validForm} errMessage={modules['tracks'].errMessage}
                                            setParams={setModuleParams} />
                                    }
                                    {initial4DGB['annotations'].process.on &&
                                        <Annotations title={initial4DGB['annotations'].process.full_name} name={'annotations'} workflow={workflow}
                                            isValid={modules['annotations'].validForm} errMessage={modules['annotations'].errMessage}
                                            setParams={setModuleParams} />
                                    }
                                    {initial4DGB['bookmarks'].process.on &&
                                        <Bookmarks title={initial4DGB['bookmarks'].process.full_name} name={'bookmarks'} workflow={workflow}
                                            isValid={modules['bookmarks'].validForm} errMessage={modules['bookmarks'].errMessage}
                                            setParams={setModuleParams} />
                                    }
                                    <br></br>
                                </div>

                                <div className="edge-center">
                                    <Button color="primary" onClick={e => onSubmit()} disabled={!workflow || !requestSubmit}>Submit</Button>{' '}
                                </div>
                                <br></br>
                                <br></br>
                            </Form>
                        </Col>
                    </Row>
                </>
            }
        </div>
    );
}

export default AddData;
