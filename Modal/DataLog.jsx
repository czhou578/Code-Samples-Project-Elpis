import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import { API } from 'aws-amplify';
import '../../utility/utility';
import { getUrl} from '../../utility/utility';
import PropTypes from 'prop-types';

class DataLog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pdfURl: '',
            progressFormURL: [],
            createdDates: []
        };
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

      const listProfileWithProgressMonitor = `
      query ListProgressPMSurvey($limit: Int, $nextToken: String, $filter: ModelProgressFilterInput) {
        listProgresss(limit: $limit, nextToken: $nextToken, filter: $filter) {
        items {
            studentID
              createdAt
            progress_monitor_file {
            bucket
            key
            region
            }
        }
        }
    }
      
      `
        let filter = {
            id: {
                eq: this.props.studentID,
            },
        };

        let filterProgress = { //get student prop passed down here
            studentID: {
                eq: this.props.studentID
            }
        }

        try {
            const surveyKey = await API.graphql({
                query: listProfileWithSurvey,
                variables: { filter: filter },
            });
            
            const progressKeys = await API.graphql({ //retrieve both sets of keys from backend
                query: listProfileWithProgressMonitor,
                variables: {filter: filterProgress}

            })

            let superSurveyKey;

            if (
                surveyKey.data && surveyKey.data.listStudents && surveyKey.data.listStudents.items && surveyKey.data.listStudents.items.length > 0 && surveyKey.data.listStudents.items[0].Profile && 
                surveyKey.data.listStudents.items[0].Profile.superpower_survey_file.key
                ) {
                    superSurveyKey = surveyKey.data.listStudents.items[0].Profile.superpower_survey_file.key;

                }
            
            let progressFormKeys = [];
            let progressFormUrls = []; //final array containing progress monitor url's
            let progressFormDates = []; //final array containing dates of progress monitor form creation
            
            if (progressKeys.data && progressKeys.data.listProgresss && progressKeys.data.listProgresss.items && progressKeys.data.listProgresss.items.length > 0) { //push all pdf file keys to a separate array 
                let tempItems = progressKeys.data.listProgresss.items;
                tempItems.forEach((item) => {
                    if (item.progress_monitor_file != null) { 
                        progressFormKeys.push(item.progress_monitor_file.key)
                        progressFormDates.push(item.createdAt) //push dates into final array
                    }
                })
            }

            if (progressFormKeys.length == 0) { //if no progress monitors have been filled out
                getUrl(superSurveyKey).then((data) => {
                    this.setState({pdfURl: data})
                })
            }

            progressFormKeys.forEach((val, key, array) => {
                getUrl(val).then((data) => {
                    progressFormUrls.push(data)
                    
                    if (Object.is(array.length - 1, key)) {
                        getUrl(superSurveyKey).then((data) => {
                            this.setState({pdfURl: data, progressFormURL: progressFormUrls, createdDates: progressFormDates})
                        })
                    }
                })
            })

        } catch (e) {}
    };

     returnProgressElements = () => {
        let arrayProgress = this.state.progressFormURL
        let progressDates = this.state.createdDates //loop the dates

        const elements = arrayProgress.map((element, i) => 
        <div key={i}>
        <a href={element} download>Progress Monitor Form {progressDates[i].slice(0, 10)}</a>
        </div>            
        )

        return elements
    }

    returnSuperPowerSurvey = () => {
        let superSurvey = this.state.pdfURl

        const elements = <div>
            <a href={superSurvey} download> SuperPowerPdf </a>
        </div>

        return elements
    }

    render() {
        return (
            <React.Fragment>
                <Grid>
                    <Grid.Column>
                        <Grid.Row>
                            <h1>Downloads</h1>
                            {this.returnSuperPowerSurvey()}
                        </Grid.Row>
                        <Grid.Row>
                            {this.returnProgressElements()}
                        </Grid.Row>
                    </Grid.Column>
                </Grid>
            </React.Fragment>
        );
    }
}

DataLog.propTypes = {
    studentID: PropTypes.string
}

export default DataLog;