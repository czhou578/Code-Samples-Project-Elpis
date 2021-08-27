import React, { Component } from 'react';
import { Modal } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { API } from 'aws-amplify';
import { connect } from 'react-redux';
import CongratulationPopup from '../../Atoms/CongratsPopup/CongratulationPopup';

import { TopicSelection, NewModule, PathwayName, Confirmation } from '..';
import {
    createContent,
    createPathwayContent,
    createPicture,
} from '../../../graphql/mutations';
import { fetchPathwaysCreated, fetchPathways } from '../../../store/';
import { uploadFile, upload } from '../../../utility/utility';

class AddPathwayModal extends Component {
    initialState = {
        pathway: {},
        contents: [],
        pages: [],
        topics: ['Math', 'Art', 'Physics', 'Reading', 'Writing', 'Chemistry'],
        index: 0,
        openTopicSelection: true,
        openPathwayInfo: false,
        openModule: false,
        openConfirmation: false,
        unmounted: false,
        congratsPopup: false,
    };

    state = {
        ...this.initialState,
    };

    componentWillUnmount() {
        this.setState({ unmounted: true });
    }

    // when Next is clicked on topic selection page
    topicSelectionNextClickedHandler = (topic) => {
        let newPathway = Object.assign({}, this.state.pathway);
        newPathway.topic = topic;
        this.setState({
            pathway: newPathway,
            openTopicSelection: false,
            openPathwayInfo: true,
        });
    };

    // when Next is clicked on pathway info page
    pathwayNameNextClickedHandler = (name, overview, takeaway) => {
        let newPathway = Object.assign({}, this.state.pathway);
        newPathway.name = name;
        newPathway.overview = overview;
        newPathway.takeaway = takeaway;
        this.setState({
            pathway: newPathway,
            openPathwayInfo: false,
            openModule: true,
        });
    };

    // for project module, break down assignment and example into separate contents
    separateProjectContents = (content) => {
        const mainContent = {
            ...content,
        };

        delete mainContent.example;
        if (content.example !== null) {
            const exampleContent = {
                ...content,
            };

            exampleContent.file = exampleContent.example;
            exampleContent.description = 'example';
            delete exampleContent.example;
            return [mainContent, exampleContent];
        }

        return [mainContent];
    };

    // when Next is clicked on module page
    moduleNextClickedHandler = (content) => {
        if (content !== null) {
            if (content.type === 'Project') {
                const projectContents = this.separateProjectContents(content);
                this.setState((prev) => {
                    return {
                        ...prev,
                        contents: [...prev.contents, ...projectContents],
                    };
                });
            } else {
                this.setState((prev) => {
                    return {
                        ...prev,
                        contents: [...prev.contents, content],
                    };
                });
            }
        } else {
            this.setState({
                openConfirmation: false,
                openModule: true,
            });
        }
    };

    // when Done is clicked on module page
    moduleCompleteClickedHandler = (content) => {
        if (content.type === 'Project') {
            const projectContents = this.separateProjectContents(content);
            this.setState((prev) => {
                return {
                    ...prev,
                    contents: [...prev.contents, ...projectContents],
                    openModule: false,
                    openConfirmation: true,
                };
            });
        } else {
            this.setState((prev) => {
                return {
                    ...prev,
                    contents: [...prev.contents, content],
                    openModule: false,
                    openConfirmation: true,
                };
            });
        }
    };

    // when Done is clicked on confirmation page
    pathwayCompleteHandler = async () => {
        this.setState({
            openConfirmation: false,
            congratsPopup: true,
        });

        const pathway = {
            name: this.state.pathway.name,
            category: this.state.pathway.topic,
            description: this.state.pathway.overview,
            LearningOutcome: this.state.pathway.takeaway,
            is_approved: true,
        };

        const createPathway2 = /* GraphQL */ `
            mutation CreatePathway(
                $input: CreatePathwayInput!
                $condition: ModelPathwayConditionInput
            ) {
                createPathway(input: $input, condition: $condition) {
                    id
                    name
                    is_approved
                    category
                    description
                    LearningOutcome
                    _version
                    _deleted
                    _lastChangedAt
                    createdAt
                    updatedAt
                    owner
                }
            }
        `;

        const newPathway = await API.graphql({
            query: createPathway2,
            variables: { input: pathway },
            authMode: 'AMAZON_COGNITO_USER_POOLS',
        });

        for (let i = 0; i < this.state.contents.length; i++) {
            const content = this.state.contents[i];
            const contentInput = {
                name: content.name,
                type: content.type,
                description: content.description,
            };

            if (content.file !== null) {
                // pass in S3 file structure for second argument
                const s3Object = await uploadFile(
                    content.file,
                    'pathways/' + newPathway.data.createPathway.id
                );
                const fileData = {
                    name: content.file.name,
                    file: s3Object,
                };
                await upload(fileData, createPicture);
                contentInput.upload_file = s3Object;
            }

            if (content.articleInput !== '') {
                contentInput.article_input = content.articleInput;
            }

            if (content.link !== '') {
                contentInput.resource_link = content.link;
            }

            const newContent = await API.graphql({
                query: createContent,
                variables: { input: contentInput },
            });

            const pathwayContentInput = {
                pathwayID: newPathway.data.createPathway.id,
                contentID: newContent.data.createContent.id,
            };

            const newPathwayContent = await API.graphql({
                query: createPathwayContent,
                variables: { input: pathwayContentInput },
            });

            await this.props.fetchPathwaysCreated();
            await this.props.fetchPathways();
        }
    };

    setOpenHandler = (open) => {
        this.setState({ ...this.initialState });
        this.props.setOpen(open);
    };

    render() {
        return (
            <Modal
                onClose={() => this.setOpenHandler(false)}
                onOpen={() => this.props.setOpen(true)}
                open={this.props.open}
                style={{ width: '80vw', height: '80vh' }}
            >
                <Modal.Header>{this.props.title}</Modal.Header>
                <Modal.Content>
                    {this.state.openTopicSelection ? (
                        <TopicSelection
                            setOpen={this.setOpenHandler}
                            next={(topic) =>
                                this.topicSelectionNextClickedHandler(topic)
                            }
                            listTopics={this.state.topics}
                        />
                    ) : null}
                    {this.state.openPathwayInfo ? (
                        <PathwayName
                            setOpen={this.setOpenHandler}
                            next={(name, overview, takeaway) =>
                                this.pathwayNameNextClickedHandler(
                                    name,
                                    overview,
                                    takeaway
                                )
                            }
                        />
                    ) : null}
                    {this.state.openModule ? (
                        <NewModule
                            setOpen={this.setOpenHandler}
                            next={(content) =>
                                this.moduleNextClickedHandler(content)
                            }
                            complete={(content) =>
                                this.moduleCompleteClickedHandler(content)
                            }
                            index={this.state.contents.length + 1}
                            contents={this.state.contents}
                        />
                    ) : null}

                    {this.state.openConfirmation ? (
                        <Confirmation
                            setOpen={this.setOpenHandler}
                            next={() => this.moduleNextClickedHandler(null)}
                            complete={this.pathwayCompleteHandler}
                        />
                    ) : null}

                    {this.state.congratsPopup ? (
                        <CongratulationPopup
                            setOpen={() => this.setOpenHandler(false)}
                        />
                    ) : null}
                </Modal.Content>
            </Modal>
        );
    }
}

AddPathwayModal.propTypes = {
    open: PropTypes.bool,
    setOpen: PropTypes.func,
    title: PropTypes.string,
    pathways: PropTypes.object,
    isAuthenticated: PropTypes.bool,
    fetchPathwaysCreated: PropTypes.func,
    fetchPathways: PropTypes.func,
};

// get access to desired global states
const mapStateToProps = (state) => {
    return {
        pathways: state.cm.pathways,
        isAuthenticated: state.auth.isAuthenticated,
    };
};

export default connect(mapStateToProps, { fetchPathwaysCreated, fetchPathways })(
    AddPathwayModal
);
