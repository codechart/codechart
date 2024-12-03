package ua.haltentech.plugin.webview.browser;

import java.util.List;

public class JsFunctionParameters {
    private Object ideEventObject;
    private String lineContent;
    private int lineNumber;
    private String filePath;
    private String projectPath;
    private String fileContent;
    private List<String> folderFiles;
    private boolean isReplaceNode;

    public static JsFunctionParameters of(Object ideEventObject,
                                          String filePath,
                                          String projectPath,
                                          String lineContent,
                                          int lineNumber,
                                          String fileContent,
                                          List<String> folderFiles) {
        JsFunctionParameters parameters = new JsFunctionParameters();

        parameters.setIdeEventObject(ideEventObject);
        parameters.setFilePath(filePath);
        parameters.setProjectPath(projectPath);
        parameters.setLineContent(lineContent);
        parameters.setLineNumber(lineNumber);
        parameters.setFileContent(fileContent);
        parameters.setFolderFiles(folderFiles);

        return parameters;
    }

    public static JsFunctionParameters of(Object ideEventObject,
                                          boolean isReplaceNode,
                                          String filePath,
                                          String projectPath,
                                          String lineContent,
                                          int lineNumber,
                                          String fileContent) {
        JsFunctionParameters parameters = new JsFunctionParameters();

        parameters.setIdeEventObject(ideEventObject);
        parameters.setisReplaceNode(isReplaceNode);
        parameters.setFilePath(filePath);
        parameters.setProjectPath(projectPath);
        parameters.setLineContent(lineContent);
        parameters.setLineNumber(lineNumber);
        parameters.setFileContent(fileContent);

        return parameters;
    }

    public Object getIdeEventObject() {
        return ideEventObject;
    }

    public void setIdeEventObject(Object ideEventObject) {
        this.ideEventObject = ideEventObject;
    }

    public String getLineContent() {
        return lineContent;
    }

    public void setLineContent(String lineContent) {
        this.lineContent = lineContent;
    }

    public int getLineNumber() {
        return lineNumber;
    }

    public void setLineNumber(int lineNumber) {
        this.lineNumber = lineNumber;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getProjectPath() {
        return projectPath;
    }

    public void setProjectPath(String projectPath) {
        this.projectPath = projectPath;
    }

    public String getFileContent() {
        return fileContent;
    }

    public void setFileContent(String fileContent) {
        this.fileContent = fileContent;
    }

    public List<String> getFolderFiles() {
        return folderFiles;
    }

    public void setFolderFiles(List<String> folderFiles) {
        this.folderFiles = folderFiles;
    }

    public boolean isReplaceNode() {
        return isReplaceNode;
    }

    public void setisReplaceNode(boolean isReplaceNode) {
        this.isReplaceNode = isReplaceNode;
    }
}
