import React, { Component } from 'react';
import { Grid, Button, Dropdown, Container } from 'semantic-ui-react';
import { API } from 'aws-amplify';
import '../../utility/utility';
import { getUrl } from '../../utility/utility';
import PropTypes from 'prop-types';
import PMTemplate from './PMTemplate';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formData } from '../Molecules/ProgressMonitorForm/index';
import styles from './datalog.module.css';

class DataLog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pdfURl: '',
            progressFormURL: [],
            formData: [],
            selectedFilterDate: null, //for selected date
            selectedFilters: [], //selected filter state (its a 2d array, so i'm using the last array in the big array, you will see "-1.length")
            subjectFilter: null,
            progressFilter: null,
            downloadLinkLabels: [],
            nothingFound: null,
            contentData: null,
            iepGoalNames: null,
            documentClickedOn: null,
            shouldSwitchDocument: null,
            searchClicked: false,
            showDocument: false,
            loadingData: false
        };
        this.refCollection = [];
        this.datePicker = React.createRef();
        this.inputRef = React.createRef();
    }

    componentDidMount = async (value) => {
        const listProfileWithSurvey = `
        query ListProfileSurveys(
            $limit: Int
            $nextToken: String
            $filter: ModelStudentFilterInput
            ) {
                listStudents(filter: $filter, limit: $limit, nextToken: $nextToken) {
                items {
                    id
                    name
                    Profile {
                    id
                    superpower_survey_file {
                        bucket
                        region
                        key
                    }
                    }
                }
                nextToken
                startedAt
                }
            }        
      `;

        let filter = {
            id: {
                eq: this.props.studentID,
            },
        };

        try {
            const surveyKey = await API.graphql({
                query: listProfileWithSurvey,
                variables: { filter: filter },
            });

            let superSurveyKey;

            if (
                surveyKey.data &&
                surveyKey.data.listStudents &&
                surveyKey.data.listStudents.items &&
                surveyKey.data.listStudents.items.length > 0 &&
                surveyKey.data.listStudents.items[0].Profile &&
                surveyKey.data.listStudents.items[0].Profile.superpower_survey_file
                    .key
            ) {
                superSurveyKey =
                    surveyKey.data.listStudents.items[0].Profile
                        .superpower_survey_file.key;
            }
            getUrl(superSurveyKey).then((data) => {
                this.setState({ pdfURl: data });
            });
        } catch (e) {}
    };

    onChange = async () => {
        // set state of selectedfilterdate
        this.setState({
            selectedFilterDate: this.datePicker.current.state.selectedDateFormatted,
        });

    };

    printDocument = () => {
        if (this.inputRef.current == null) {
            return
        }

        html2canvas(this.inputRef.current).then((canvas) => {
            // variables used when sizing the html to PDF, and multiple pages
            var HTML_Width = canvas.width;
            var HTML_Height = canvas.height;
            var top_left_margin = 40;
            var PDF_Width = HTML_Width + top_left_margin * 2;
            var PDF_Height = PDF_Width * 1.5 + top_left_margin * 2;
            var canvas_image_width = HTML_Width;
            var canvas_image_height = HTML_Height;

            var totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('portrait', 'mm', [PDF_Width, PDF_Height]);
            pdf.addImage(
                imgData,
                'PNG',
                top_left_margin,
                top_left_margin,
                canvas_image_width,
                canvas_image_height
            );

            for (var i = 1; i <= totalPDFPages; i++) {
                pdf.addPage([PDF_Width, PDF_Height], 'portrait');
                pdf.addImage(
                    imgData,
                    'PNG',
                    top_left_margin,
                    -(PDF_Height * i) + top_left_margin * 2,
                    canvas_image_width,
                    canvas_image_height
                );
            }

            if (this.state.documentClickedOn.length == 4) {
                //assign pdf file title that will appear when downloaded
                pdf.save(this.state.documentClickedOn[3]);
            }
        });
    };

    returnSuperPowerSurvey = () => {
        let superSurvey = this.state.pdfURl;

        const elements = (
            <Container>
                <a href={superSurvey} download>
                    {' '}
                    SuperPowerPdf{' '}
                </a>
            </Container>
        );

        return elements;
    };

    queryProgressData = async (e) => {
        const ListProgressData = `query ListProgressFormData($limit: Int, $nextToken: String, $filter: ModelProgressFilterInput) {
            listProgresss(limit: $limit, nextToken: $nextToken, filter: $filter) {
              items {
                studentID
                createdAt
                progress_monitor_file {
                  bucket
                  key
                  region
                }
                _version
                academic_strengths
                academic_weaknesses
                attendance_frequency
                casemanagerID
                extra_input
                iep_goal
                iepgoalID
                improve_area
                meet_daily_objectives
                observation
                progress_toward_iep
                school_class
                success_used_support
              }
            }
          }
          `;

        //seperate query for iepGoal, since the previous query retrieved just the
        const iepGoalQuery = ` query ListIEPGoals(
            $filter: ModelIEPGoalFilterInput
            $limit: Int
            $nextToken: String
          ) {
            listIEPGoals(filter: $filter, limit: $limit, nextToken: $nextToken) {
              items {
                id
                name
              }
              nextToken
              startedAt
            }
          }`;

        let queryFilter = {
            studentID: { eq: this.props.studentID },
        };

        queryFilter.and = []

        if (this.state.selectedFilterDate != null) {
            queryFilter.and.push({
                createdAt: { beginsWith: this.state.selectedFilterDate },
            });
        }            

        formData.progressTowardIEPOptions.forEach((element) => {
            //matches iep option with the formdata constants
            if (
                this.state.selectedFilters[
                    this.state.selectedFilters.length - 1
                ].indexOf(element.key) != -1
            ) {
                queryFilter.and.push({
                    progress_toward_iep: { eq: element.key },
                });
            }
        });

        formData.schoolClasses.forEach((element) => {
            if (
                this.state.selectedFilters[
                    this.state.selectedFilters.length - 1
                ].indexOf(element.key) != -1
            ) {
                queryFilter.and.push({ school_class: { eq: element.key } });
            }
        });
 
        try {
            const data = await API.graphql({
                query: ListProgressData,
                variables: { filter: queryFilter },
            });

            let iepGoalNames = [];
            let dataToSet = []; //array that will contain query matches

            data.data.listProgresss.items.forEach(async (element) => {
                if (
                    this.state.selectedFilterDate != null && //this can be replaced if query by date to dynamodb could be fixed
                    element.createdAt.slice(0, 10) == this.state.selectedFilterDate
                ) {
                    dataToSet.push(element);

                    const iepGoalName = await API.graphql({
                        //push iep goals to iepgoalnames array
                        query: iepGoalQuery,
                        variables: { filter: { id: { eq: element.iepgoalID } } },
                    });

                    iepGoalNames.push(iepGoalName.data.listIEPGoals.items[0].name);
                } else if (
                    (this.state.selectedFilterDate == null &&
                        this.state.selectedFilters[
                            this.state.selectedFilters.length - 1
                        ].length > 0) ||
                    (this.state.selectedFilterDate == '' &&
                        this.state.selectedFilters[
                            this.state.selectedFilters.length - 1
                        ].length > 0)
                ) {
                    dataToSet.push(element);
                } else if (
                    this.state.selectedFilterDate != null &&
                    element.createdAt.slice(0, 10) != this.state.selectedFilterDate
                ) {

                    return;
                }
            });

            if (dataToSet.length == 0) {
                this.setState({ nothingFound: true });
                
            } else if (dataToSet.length > 0) {
                this.setState({
                    contentData: dataToSet,
                    iepGoalNames: iepGoalNames,
                }); //set the arrays
            }
        } catch (e) {}
    };

    onSearchButton = async () => {
        await this.onChangeFilter()

        if (this.state.searchClicked == true) {
            if (
                this.state.selectedFilterDate == null &&
                this.state.selectedFilters.length == 0
                ) {
                    return;
                }
                this.setState({
                    searchClicked: false,
                    contentData: null,
                    iepGoalNames: null,
                    nothingFound: false,
                    shouldSwitchDocument: false,
                });
                this.queryProgressData();
                this.setState({ searchClicked: true });
            } else {
                this.setState({ searchClicked: true});
                this.queryProgressData();
        }
    };

    showSpecificDoc = (index) => {
        //when user clicks between displayed document links
        if (this.refCollection[index] != undefined) {
            if (this.refCollection[index] != this.state.documentClickedOn) {
                let downloadString = `Progress Monitor Form ${this.state.contentData[
                    index
                ].createdAt.slice(0, 10)} ${
                    this.state.contentData[index].school_class
                } ${this.state.contentData[index].progress_toward_iep}`;
                this.setState({
                    documentClickedOn: [
                        this.refCollection[index], //ref collection stores refs to the newly created links ('a' tags )
                        this.state.contentData[index],
                        this.state.iepGoalNames[index],
                        downloadString,
                    ],
                    shouldSwitchDocument: true,
                });
            }
        }
    };

    setClickedOnSubjectFilter = async (event, data) => {
        if (data.value != undefined) {
            await this.setStateSynchronous(state => ({subjectFilter: state.subjectFilter = data.value}))
        }
    }

    setClickedOnProgressFilter = async (event, data) => {

        if (data.value != undefined) {
            await this.setStateSynchronous(state => ({progressFilter: state.progressFilter = data.value}))
        }
    }

    setStateSynchronous = (stateUpdate) => {
        return new Promise(resolve => {
            this.setState(stateUpdate, () => resolve());
        });
    }

    onChangeFilter = async () => { //deleted event and data
        
        if (this.state.subjectFilter == null) {
            let array = []
            array.push(this.state.progressFilter)
            await this.setStateSynchronous(state => ({selectedFilters: [...state.selectedFilters, array]}))
            
        } else if (this.state.progressFilter == null) {
            let array = []
            array.push(this.state.subjectFilter)
            await this.setStateSynchronous(state => ({selectedFilters: [...state.selectedFilters, array]}))

        } else {
            let array = []
            array.push(this.state.subjectFilter)
            array.push(this.state.progressFilter)
            
    
            await this.setStateSynchronous(state => ({selectedFilters: [...state.selectedFilters, array]}))
        }
    };

    render() {
        var subjectsOptions = []
        var progressesOptions = []
        var options = [];
        formData.schoolClasses.forEach((element) => {
            options.push(element);
            subjectsOptions.push(element)
        });

        formData.progressTowardIEPOptions.forEach((element) => {
            options.push(element);
            progressesOptions.push(element)
        });

        return (
            <React.Fragment>
                <Grid>
                    <Grid.Column>
                        <Grid.Row>
                            <h1>Downloads</h1>
                            {this.returnSuperPowerSurvey()}
                        </Grid.Row>
                        <Grid.Row columns={2}>
                            <Grid.Column>
                                <Container className={styles.pMonHeader}>
                                    <h4>Progress Monitor Filter</h4>
                                </Container>
                                <Container className={styles.datePicker}>
                                    <h5>Select Date</h5>
                                    <SemanticDatepicker
                                        ref={this.datePicker}
                                        name="dueDate"
                                        icon="calendar alternate outline"
                                        onChange={this.onChange}
                                    />
                                </Container>
                                <Container className={styles.dropdown}>
                                    <h5>Select Filters</h5>
                                    <Dropdown 
                                        placeholder="Subjects"
                                        selection
                                        fluid
                                        options={subjectsOptions}
                                        upward={false}
                                        scrolling
                                        onChange={this.setClickedOnSubjectFilter}
                                        clearable                  
                                    />
                                    <Container className={styles.dropdown2}>
                                        <Dropdown 
                                            placeholder="Progress Towards IEP Goal"
                                            selection
                                            fluid
                                            options={progressesOptions}
                                            upward={false}
                                            scrolling
                                            onChange={this.setClickedOnProgressFilter}
                                            clearable                                    
                                        />
                                    </Container>
                                </Container>
                            </Grid.Column>
                            <Grid.Column>
                                <Container className={styles.btnContainer}>
                                    <Button positive onClick={this.onSearchButton}>
                                        Search
                                    </Button>
                                    <Button
                                        secondary={true}
                                        onClick={this.printDocument}
                                        className={styles.button}
                                    >
                                        Download
                                    </Button>
                                </Container>
                            </Grid.Column>

                            {this.state.contentData == null ? <Container className={styles.cantDownload}><h3>No Results. No Downloads Possible</h3></Container> : null}

                            {(this.state.selectedFilters.length == 0 &&
                                this.state.selectedFilterDate == null &&
                                this.state.searchClicked) ||
                            (this.state.selectedFilters.length > 0 &&
                                this.state.selectedFilters[
                                    this.state.selectedFilters.length - 1
                                ].length == 0 &&
                                this.state.selectedFilterDate == '' &&
                                this.state.searchClicked) ||
                            (this.state.selectedFilters.length > 0 &&
                                this.state.selectedFilters[
                                    this.state.selectedFilters.length - 1
                                ].length == 0 &&
                                this.state.selectedFilterDate == null &&
                                this.state.searchClicked) ? (
                                <Container className={styles.initialClickNoFilter}>
                                    <h3> Please Enter Data!</h3>
                                </Container>
                            ) : null}
                            {this.state.nothingFound != true ? (
                                <Container>
                                    {this.state.searchClicked == true ? (
                                        <Container
                                            className={styles.documentContainer}
                                        >
                                            {
                                            this.state.selectedFilters.length == 0 ? null : this.state.selectedFilters[this.state.selectedFilters.length - 1].length == 0 ? null :
                                            this.state.contentData != null
                                                ? this.state.contentData.map(
                                                      (element, index) => {
                                                          return (
                                                              <Container key={index}>
                                                                  <a
                                                                      href="#"
                                                                       role="button"
                                                                      ref={(refs) =>
                                                                          (this.refCollection[
                                                                              index
                                                                          ] = refs)
                                                                      }
                                                                      className="link"
                                                                      onClick={(
                                                                          e
                                                                      ) => {
                                                                          e.preventDefault(),
                                                                              this.showSpecificDoc(
                                                                                  index
                                                                              );
                                                                      }}
                                                                  >{`Progress Monitor Form ${element.createdAt.slice(
                                                                      0,
                                                                      10
                                                                  )} ${
                                                                      element.school_class
                                                                  } ${
                                                                      element.progress_toward_iep
                                                                  }`}</a>
                                                              </Container>
                                                          );
                                                      }
                                                  )
                                                : null}
                                            <div id="divToPrint" ref={this.inputRef}>
                                                {this.state.selectedFilters.length >
                                                    0 &&
                                                this.state.selectedFilters[
                                                    this.state.selectedFilters
                                                        .length - 1
                                                ].length == 0 ? null : this.state
                                                      .shouldSwitchDocument ? (
                                                    <Container
                                                        className={
                                                            styles.previewContainer
                                                        }
                                                    >
                                                        <h4>Download Preview</h4>
                                                        <PMTemplate
                                                            contentData={
                                                                this.state
                                                                    .documentClickedOn[1]
                                                            }
                                                            iepGoalName={
                                                                this.state
                                                                    .documentClickedOn[2]
                                                            }
                                                        />
                                                    </Container>
                                                ) : null}
                                            </div>
                                        </Container>
                                    ) : null}
                                </Container>
                            ) : null
                            
                            }
                        </Grid.Row>
                    </Grid.Column>
                </Grid>
            </React.Fragment>
        );
    }
}

DataLog.propTypes = {
    studentID: PropTypes.string,
};

export default DataLog;
