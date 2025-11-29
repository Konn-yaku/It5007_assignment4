import React, {useState} from 'react';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    Button,
    useColorScheme,
    View,
} from 'react-native';

const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
    if (dateRegex.test(value)) return new Date(value);
    return value;
}

async function graphQLFetch(query, variables = {}) {
    try {
        /****** Q4: Correct IP/port for Android Emulator ******/
            // 使用 10.0.2.2 访问宿主机的 localhost:3000
        const response = await fetch('http://10.0.2.2:3000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ query, variables })
            });
        const body = await response.text();
        const result = JSON.parse(body, jsonDateReviver);

        if (result.errors) {
            const error = result.errors[0];
            if (error.extensions.code == 'BAD_USER_INPUT') {
                const details = error.extensions.exception.errors.join('\n ');
                alert(`${error.message}:\n ${details}`);
            } else {
                alert(`${error.extensions.code}: ${error.message}`);
            }
        }
        return result.data;
    } catch (e) {
        alert(`Error in sending data to server: ${e.message}`);
    }
}

// --- Bonus: Navigation Bar 组件 ---
function Navbar() {
    return (
        <View style={styles.navbar}>
            <Text style={styles.navbarTitle}>Issue Tracker</Text>
        </View>
    );
}

// --- Bonus: 美化后的样式表 (Bootstrap 风格) ---
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' }, // 浅灰背景

    // 表格样式
    header: { height: 50, backgroundColor: '#343a40' }, // 深色表头
    headerText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
    text: { textAlign: 'center', color: '#212529' },
    row: { height: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#dee2e6' },

    // 输入框样式
    input: {
        height: 40,
        borderColor: '#ced4da',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff'
    },

    // 标题样式
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#495057'
    },

    // 导航栏样式
    navbar: {
        height: 60,
        backgroundColor: '#007bff', // Bootstrap Primary Blue
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
    },
    navbarTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    }
});

const width= [40,80,80,80,80,80,200];

class IssueFilter extends React.Component {
    render() {
        return (
            <View style={{marginBottom: 10, padding: 5, borderBottomWidth: 1, borderBottomColor: '#dee2e6'}}>
                {/****** Q1: Dummy Component ******/}
                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#495057'}}>
                    Issue Filter (Dummy Component)
                </Text>
                {/****** Q1: End ******/}
            </View>
        );
    }
}

function IssueRow(props) {
    const issue = props.issue;
    {/****** Q2: Row Data ******/}
    const rowData = [
        issue.id,
        issue.status,
        issue.owner,
        issue.created ? issue.created.toDateString() : '',
        issue.effort,
        issue.due ? issue.due.toDateString() : '',
        issue.title
    ];
    {/****** Q2: End ******/}
    return (
        <>
            {/****** Q2: Render Row ******/}
            <Row data={rowData} widthArr={width} style={styles.row} textStyle={styles.text} />
            {/****** Q2: End ******/}
        </>
    );
}

function IssueTable(props) {
    const issueRows = props.issues.map(issue =>
        <IssueRow key={issue.id} issue={issue} />
    );

    {/****** Q2: Table Header ******/}
    const tableHead = ['ID', 'Status', 'Owner', 'Created', 'Effort', 'Due Date', 'Title'];
    {/****** Q2: End ******/}

    return (
        <View>
            {/****** Q2: Render Table ******/}
            <ScrollView horizontal={true}>
                <View>
                    <Table borderStyle={{borderWidth: 1, borderColor: '#dee2e6'}}>
                        <Row data={tableHead} widthArr={width} style={styles.header} textStyle={styles.headerText}/>
                        {issueRows}
                    </Table>
                </View>
            </ScrollView>
            {/****** Q2: End ******/}
        </View>
    );
}

class IssueAdd extends React.Component {
    constructor() {
        super();
        this.handleSubmit = this.handleSubmit.bind(this);

        // 计算默认 10 天后
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 10);
        const dateStr = defaultDate.toISOString().substr(0, 10);

        /****** Q3: State Initialization ******/
        this.state = {
            owner: '',
            title: '',
            effort: '',
            due: dateStr
        };

        this.handleOwnerChange = this.handleOwnerChange.bind(this);
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleEffortChange = this.handleEffortChange.bind(this);
        this.handleDueChange = this.handleDueChange.bind(this);
        /****** Q3: End ******/
    }

    /****** Q3: Input Handlers ******/
    handleOwnerChange(owner) { this.setState({ owner }); }
    handleTitleChange(title) { this.setState({ title }); }
    handleEffortChange(effort) { this.setState({ effort }); }
    handleDueChange(due) { this.setState({ due }); }
    /****** Q3: End ******/

    handleSubmit() {
        /****** Q3: Submit Logic ******/
        const issue = {
            owner: this.state.owner,
            title: this.state.title,
            effort: this.state.effort ? parseInt(this.state.effort, 10) : undefined,
            due: new Date(this.state.due),
        };

        this.props.createIssue(issue);

        // 重置表单
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 10);
        const dateStr = defaultDate.toISOString().substr(0, 10);

        this.setState({
            owner: '',
            title: '',
            effort: '',
            due: dateStr
        });
        /****** Q3: End ******/
    }

    render() {
        return (
            <View>
                {/****** Q3: Render Form ******/}
                <Text style={styles.sectionHeader}>Add New Issue</Text>

                <TextInput
                    placeholder="Owner"
                    value={this.state.owner}
                    onChangeText={this.handleOwnerChange}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Title"
                    value={this.state.title}
                    onChangeText={this.handleTitleChange}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Effort (Int)"
                    value={this.state.effort}
                    onChangeText={this.handleEffortChange}
                    keyboardType="numeric"
                    style={styles.input}
                />

                <TextInput
                    placeholder="Due Date (YYYY-MM-DD)"
                    value={this.state.due}
                    onChangeText={this.handleDueChange}
                    style={styles.input}
                />

                <Button onPress={this.handleSubmit} title="Add Issue" color="#007bff" />
                {/****** Q3: End ******/}
            </View>
        );
    }
}

class BlackList extends React.Component {
    constructor()
    {   super();
        this.handleSubmit = this.handleSubmit.bind(this);
        /****** Q4: State Initialization ******/
        this.state = { name: '' };
        this.handleNameChange = this.handleNameChange.bind(this);
        /****** Q4: End ******/
    }
    /****** Q4: Input Handler ******/
    handleNameChange(name) {
        this.setState({ name });
    }
    /****** Q4: End ******/

    async handleSubmit() {
        /****** Q4: Submit Logic ******/
        const nameInput = this.state.name;
        const query = `mutation addToBlacklist($nameInput: String!) {
            addToBlacklist(nameInput: $nameInput)
        }`;

        const data = await graphQLFetch(query, { nameInput });

        if (data) {
            alert(`Added ${nameInput} to blacklist successfully!`);
            this.setState({ name: '' });
        }
        /****** Q4: End ******/
    }

    render() {
        return (
            <View style={{marginTop: 10, borderTopWidth: 1, borderTopColor: '#dee2e6', paddingTop: 10}}>
                {/****** Q4: Render Blacklist Form ******/}
                <Text style={styles.sectionHeader}>Blacklist Owner</Text>

                <TextInput
                    placeholder="Enter Owner Name to Blacklist"
                    value={this.state.name}
                    onChangeText={this.handleNameChange}
                    style={styles.input}
                />

                <Button onPress={this.handleSubmit} title="Add to Blacklist" color="#dc3545"/>
                {/****** Q4: End ******/}
            </View>
        );
    }
}

export default class IssueList extends React.Component {
    constructor() {
        super();
        this.state = { issues: [] };
        this.createIssue = this.createIssue.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        const query = `query {
        issueList {
        id title status owner
        created effort due
        }
    }`;

        const data = await graphQLFetch(query);
        if (data) {
            this.setState({ issues: data.issueList });
        }
    }

    async createIssue(issue) {
        const query = `mutation issueAdd($issue: IssueInputs!) {
        issueAdd(issue: $issue) {
        id
        }
    }`;

        const data = await graphQLFetch(query, { issue });
        if (data) {
            this.loadData();
        }
    }

    render() {
        return (
            <>
                {/* Navigation Bar */}
                <Navbar />

                <ScrollView style={styles.container}>
                    {/****** Q1: Filter ******/}
                    <IssueFilter />
                    {/****** Q1: End ******/}

                    {/****** Q2: Table ******/}
                    <View style={{marginVertical: 10}}>
                        <IssueTable issues={this.state.issues} />
                    </View>
                    {/****** Q2: End ******/}

                    {/****** Q3: Add Issue ******/}
                    <IssueAdd createIssue={this.createIssue} />
                    {/****** Q3: End ******/}

                    {/****** Q4: Blacklist ******/}
                    <BlackList />
                    {/****** Q4: End ******/}

                    {/* 底部留白，防止被圆角屏幕遮挡 */}
                    <View style={{height: 50}} />
                </ScrollView>
            </>

        );
    }
}