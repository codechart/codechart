package ua.haltentech.plugin.webview.actions;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.CommonDataKeys;
import com.intellij.openapi.editor.*;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.util.TextRange;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.psi.PsiFile;
import com.intellij.psi.PsiManager;
import org.jetbrains.annotations.NotNull;
import ua.haltentech.plugin.webview.browser.BrowserService;
import ua.haltentech.plugin.webview.browser.JsFunctionParameters;

public class SendToWebviewFromEditorAction extends AnAction {
    @Override
    public void actionPerformed(@NotNull AnActionEvent actionEvent) {
        Project project = actionEvent.getData(CommonDataKeys.PROJECT);
        String actionId = actionEvent.getActionManager().getId(this);
        boolean isReplaceNode = "ua.haltentech.plugin.webview.actions.ReplaceInCodeChart".equals(actionId);


        if (project == null) {
            return;
        }

        VirtualFile virtualFile = actionEvent.getData(CommonDataKeys.VIRTUAL_FILE);

        if (virtualFile == null) {
            return;
        }

        Editor editor = actionEvent.getData(CommonDataKeys.EDITOR);

        if (editor == null) {
            return;
        }

        PsiFile psiFile = PsiManager.getInstance(project).findFile(virtualFile);

        if (psiFile == null) {
            return;
        }

        CaretModel caretModel = editor.getCaretModel();
        Caret primaryCaret = caretModel.getPrimaryCaret();
        LogicalPosition caretPos = primaryCaret.getLogicalPosition();

        JsFunctionParameters parameters = JsFunctionParameters.of(
                "SendToWebviewFromEditorAction",
                isReplaceNode,
                virtualFile.getPath(),
                project.getBasePath(),
                getCurrentLineContent(editor),
                caretPos.line,
                psiFile.getText());

        project.getService(BrowserService.class).executeClickedOnLineFunction(parameters);
    }

    private String getCurrentLineContent(Editor editor) {
        int offset = editor.getCaretModel().getOffset();
        Document document = editor.getDocument();
        int line = document.getLineNumber(offset);

        return document.getText(new TextRange(document.getLineStartOffset(line), document.getLineEndOffset(line)));
    }
}
