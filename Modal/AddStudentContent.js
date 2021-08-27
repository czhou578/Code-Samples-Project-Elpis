import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, Message, Form } from 'semantic-ui-react';
import { API } from 'aws-amplify';
import { createCaseManagerStudent } from '../../../graphql/mutations';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { SearchStudents } from '..';
import { AddStudentButtons } from './AddStudentButtons';
import '../../../store/CaseManager/actions/actions'
import { fetchStudents } from '../../../store/CaseManager/actions/actions';
import { connect } from 'react-redux';

const AddStudentContent = (props) => {
    const { setOpen, casemanagerID } = props;
    const [alert, setAlert] = useState();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState();
    const initialValues = {
        selectedStudents: [],
    };

    const validationSchema = Yup.object({
        students: Yup.array()
            .min(1, 'Please Select at least 1 student')
            .required('Required'),
    });

    const searchHandler = async (value) => {
        const listStudentsWithProfiles = /* GraphQL */ `
            query ListStudents(
                $filter: ModelStudentFilterInput
                $limit: Int
                $nextToken: String
            ) {
                listStudents(filter: $filter, limit: $limit, nextToken: $nextToken) {
                    items {
                        id
                        name
                        email
                        is_active
                        _version
                        _deleted
                        _lastChangedAt
                        createdAt
                        updatedAt
                        Profile {
                            id
                            grade
                            post_secondary
                            interests
                            career_interest
                            skill_strengths
                            skill_weaknesses
                        }
                        casemanagers {
                            items {
                                casemanager {
                                    id
                                }
                            }
                        }
                    }
                    nextToken
                    startedAt
                }
            }
        `;
        let filter = {
            name: {
                contains: value,
            },

            is_active: {
                eq: true,
            },
        };
        setLoading(true);
        // fetch all students filtered by name
        try {
            const data = await API.graphql({
                query: listStudentsWithProfiles,
                variables: { filter: filter },
            });

            const found = data.data.listStudents.items.filter(
                (student) =>
                    student.Profile !== null &&
                    student.casemanagers.items.length === 0
            );

            if (found.length === 0) {
                setLoading(false);
                setAlert({
                    message: 'Failed to find student',
                    status: 'fail',
                });

                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

                wait(5000).then(() => {
                    setAlert(null);
                });

                return
            }

            setStudents(oldArray => [...oldArray, found]);
            setLoading(false);
        } catch (err) {
            //console.log(error) Don't think we need this try catch
        }
    };

    const addStudentToCaseLoad = async (data) => {
        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        try {
            await API.graphql({
                query: createCaseManagerStudent,
                variables: { input: data },
            });

            setAlert({
                message: 'Successfully added student to caseload',
                status: 'success',
            });
            wait(5000).then(() => setAlert(null));
        } catch (err) {
            setAlert({
                message: 'Fail to add student to caseload',
                status: 'fail',
            });
            wait(5000).then(() => setAlert(null));
            throw err;
        }
    };

    const onSubmit = async (values, actions) => {
        const data = values.students.map((student) => ({
            studentID: student,
            casemanagerID: casemanagerID,
            is_collaborator: false
        }));

        try {
            for (let item of data) {
                if (item) await addStudentToCaseLoad(item);
                fetchStudents(casemanagerID, false)
            }
        } catch (err) {
            // console.log(err) -was here when I started;
        }
        // filter out students has been assigned and remove from search result
        let unassignedStudents = students.filter(
            (student) => !values.students.includes(student.id)
        );
        setStudents([])
        setStudents(oldArray => [...oldArray, unassignedStudents]);
        actions.resetForm();
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            enableReinitialize
        >
            {(formProps) => {
                const { handleReset, handleSubmit, isValid, isSubmitting, dirty } =
                    formProps;
                return (
                    <Form onReset={handleReset} onSubmit={handleSubmit}>
                        {alert ? (
                            <Message
                                positive={alert.status === 'success'}
                                negative={alert.status === 'fail'}
                                style={{ width: '100%' }}
                                onDismiss={() => setAlert(null)}
                            >
                                {alert.message}
                            </Message>
                        ) : null}

                        <Grid columns={1} relaxed stackable divided>
                            <Grid.Row stretched>
                                <Grid.Column>
                                    <SearchStudents
                                        formProps={formProps}
                                        students={students}
                                        loading={loading}
                                        searchHandler={searchHandler}
                                        initialValues={initialValues}
                                    />
                                </Grid.Column>
                            </Grid.Row>

                            <Grid.Row columns={1} stretched>
                                <Grid.Column>
                                    <AddStudentButtons
                                        setOpen={setOpen}
                                        isValid={isValid}
                                        isSubmitting={isSubmitting}
                                        dirty={dirty}
                                    />
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Form>
                );
            }}
        </Formik>
    );
};

const mapStateToProps = (state) => {
    return {
        error: state.casemanager.error,
        casemanagerID: state.casemanager.id
    }
}

export default connect(mapStateToProps, {
    fetchStudents
}) (AddStudentContent);

AddStudentContent.propTypes = {
    setOpen: PropTypes.func,
    casemanagerID: PropTypes.string,
};
