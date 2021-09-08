import React from 'react';
import PropTypes from 'prop-types';
import { formData } from '../Molecules/ProgressMonitorForm/index';
import {
    Form,
    Divider,
    Icon,
    Header,
    Message,
    Container,
    Radio,
    TextArea,
} from 'semantic-ui-react';

import '../../utility/utility';

export default function MultiPagePdf(props) {
    const { contentData, iepGoalName } = props;
    const styles = {
        border: '2px solid grey',
        padding: '10px',
    };

    const notApplicable = 'N/A';
    const academic_strengths = contentData.academic_strengths.join(', ');
    const academic_weaknesses = contentData.academic_weaknesses.join(', ');

    return (
        <Container style={styles}>
            <Form>
                <p>
                    <strong>IEP Goal: </strong>
                    {iepGoalName}
                </p>

                <h5>Your Class</h5>
                <p>{contentData.school_class}</p>

                <h5>
                    How would you describe the student&apos;s progress toward the IEP
                    goal?
                </h5>
                {contentData && contentData.progress_toward_iep ? (
                    formData.progressTowardIEPOptions.map((element) => {
                        if (element.key == contentData.progress_toward_iep) {
                            return (
                                <Container key={element.key}>
                                    {' '}
                                    <Radio label={element.key} checked={true} />{' '}
                                </Container>
                            );
                        }
                        return (
                            <Container key={element.key}>
                                <Radio label={element.key} checked={false} />{' '}
                            </Container>
                        );
                    })
                ) : (
                    <Container>
                        <Radio label="Achieved" checked={false} />
                        <Radio label="Satisfactorily" checked={false} />
                        <Radio label="Gradually" checked={false} />
                        <Radio label="Inconsistently" checked={false} />
                        <Radio label="No Progression" checked={false} />
                    </Container>
                )}

                <h5>Student Observations</h5>
                {contentData && contentData.observation != null ? (
                    <TextArea value={contentData.observation} />
                ) : (
                    <TextArea value={notApplicable} />
                )}

                <Divider horizontal>
                    <Header as="h4">
                        <Icon name="bar chart" />
                        More Information
                    </Header>
                </Divider>

                <Message.Content>
                    The more information we have, the more meaningful we can make the
                    IEP - share whatever you can about the student&#39;s performance
                    in your class
                </Message.Content>

                <h5>1. Does this student attend class regularly?</h5>
                <Container>
                    {contentData &&
                    contentData.attendance_frequency != null &&
                    contentData.attendance_frequency == true ? (
                        <Container>
                            <Container>
                                <Radio label="Yes" checked={true} />
                            </Container>
                            <Container>
                                <Radio label="No" checked={false} />
                            </Container>
                        </Container>
                    ) : contentData &&
                      contentData.attendance_frequency != null &&
                      contentData.attendance_frequency == false ? (
                        <Container>
                            <Container>
                                <Radio label="Yes" checked={false} />
                            </Container>
                            <Container>
                                <Radio label="No" checked={true} />
                            </Container>
                        </Container>
                    ) : null}
                </Container>

                <h5>
                    2. How often does the student meet daily objectives in class?
                </h5>

                <Container>
                    {contentData &&
                    contentData.meet_daily_objectives != null ?

                        formData.meetDailyObjectivesOptions.map((element, key) => {
                            if (element.key == contentData.meet_daily_objectives) {
                                return <Container key={key}><Radio label={element.key} checked={true}/> </Container> 
                            }
                            return <Container key={key}><Radio label={element.key} /> </Container>
                        })

                        : formData.meetDailyObjectivesOptions.map((element, key) => {
 
                            return <Container key={key}><Radio label={element.key} checked={false}/> </Container>
                        })
                    
                    }
                </Container>

                <h5>3. What are two of the student&apos;s academic strengths?</h5>
                <Container>
                    {contentData &&
                    contentData.academic_strengths != null &&
                    contentData.academic_strengths.length != 0
                        ? academic_strengths
                        : notApplicable}
                </Container>

                <h5>4. What are two of the student&apos;s academic weaknesses?</h5>
                <Container>
                    {contentData &&
                    contentData.academic_weaknesses != null &&
                    contentData.academic_weaknesses.length != 0
                        ? academic_weaknesses
                        : notApplicable}
                </Container>

                <h5>
                    5. What is an area the student should focus on for improvement?
                </h5>
                {contentData && contentData.improve_area != null ? (
                    <TextArea value={contentData.improve_area} />
                ) : (
                    <TextArea value={notApplicable} />
                )}

                <h5>
                    6. What supports have you used successfully with the student?
                    (check all that apply){' '}
                </h5>
                <Container>
                    {contentData && contentData.success_used_support
                        ? formData.successUsedSupportOptions.map(
                              (element, index) => {
                                  if (
                                      contentData.success_used_support.indexOf(
                                          element.key
                                      ) != -1
                                  ) {
                                      return (
                                          <Container key={index}>
                                              <Radio
                                                  label={element.value}
                                                  key={element.key}
                                                  checked={true}
                                              />{' '}
                                          </Container>
                                      );
                                  } else {
                                      return (
                                          <Container key={index}>
                                              <Radio
                                                  label={element.value}
                                                  key={element.key}
                                                  checked={false}
                                              />{' '}
                                          </Container>
                                      );
                                  }
                              }
                          )
                        : formData.successUsedSupportOptions.map(
                              (element, index) => {
                                  return (
                                      <Container key={index}>
                                          <Radio
                                              label={element.value}
                                              key={element.key}
                                              checked={false}
                                          />{' '}
                                      </Container>
                                  );
                              }
                          )}
                </Container>
            </Form>
        </Container>
    );
}

MultiPagePdf.propTypes = {
    contentData: PropTypes.object,
    iepGoalName: PropTypes.string,
};
