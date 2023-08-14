import {
	App,
	MarkdownView,
	/* Editor, MarkdownView, Modal, */ Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	WorkspaceLeaf,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	showNoteTime: boolean;
	activateMacro: boolean;
	translucentFolderName: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	showNoteTime: false,
	activateMacro: false,
	translucentFolderName: "",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	showPopupMessage(message: string) {
		new Notice(message, 3500);
	}

	async onload() {
		await this.loadSettings();
		const statusBarItemEl = this.addStatusBarItem(); // add status bar object
		// const markdownView =
		// 	this.app.workspace.getActiveViewOfType(MarkdownView);
		// this.registerEvent(trigger_show_notes_time(statusBarItemEl));
		this.registerEvent(
			this.app.workspace.on(
				"active-leaf-change",
				async (leaf: WorkspaceLeaf) => {
					trigger_show_notes_time(this, leaf, statusBarItemEl);
				},
			),
		);

		

		// this.app.workspace.on("codemirror", (cm: CodeMirror.Editor) => {
		// 	const handler = (cm: CodeMirror.Editor, event: KeyboardEvent) => {
		// 		if (event.key === "w") {
		// 			this.showPopupMessage("w is pressed");
		// 		}
		// 	};
		// 	cm.on("keydown", handler);
		// 	this.registerEvent(() => cm.off("keydown", handler));
		// });

		// this.app.workspace.on("codemirror", this.handleCodeMirror);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon(
		// 	"dice",
		// 	"Sample Plugin",
		// 	(evt: MouseEvent) => {
		// 		// Called when the user clicks the icon.
		// 		new Notice("This is a notice!");
		// 	},
		// );
		// Perform additional things with the ribbon
		// ribbonIconEl.addClass("my-plugin-ribbon-class");

		// // This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });

		// // This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: "sample-editor-command",
		// 	name: "Sample editor command",
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection("Sample Editor Command");
		// 	},
		// });
	}

	onunload() {
		// this.app.workspace.iterateCodeMirrors((cm) => {
		// 	cm.off("keydown", this.handleKeyPress);
		// });
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
		console.log("Loaded settings");
		this.showPopupMessage("Loaded settings notice!");
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// handleCodeMirror = (cm: CodeMirror.Editor) => {
	// 	this.registerEvent(() => cm.on("keydown", this.handleKeyPress));
	// 	this.registerEvent(() => cm.off("keydown", this.handleKeyPress));
	// };

	// handleKeyPress = (cm: CodeMirror.Editor, event: KeyboardEvent) => {
	// 	if (event.key === "w") {
	// 		this.showPopupMessage("w is pressed");
	// 	}
	// };
}

export function trigger_show_notes_time(
	plugin: MyPlugin,
	leaf: WorkspaceLeaf,
	statusBarItemEl: HTMLElement,
) {
	// plugin.showPopupMessage(
	// 	`file inside! the flag is ${plugin.settings.showNoteTime}`,
	// );
	if (plugin.settings.showNoteTime) {
		if (leaf.view.getViewType() === "markdown") {
			const file = (leaf.view as MarkdownView).file;

			if (file instanceof TFile) {
				const created = window
					.moment(file.stat.ctime)
					.format("YYYY-MM-DD HH:mm:ss");
				const lastModified = window
					.moment(file.stat.mtime)
					.format("YYYY-MM-DD HH:mm:ss");

				const lang = window.localStorage.getItem("language");
				// plugin.showPopupMessage(`the languge is ${lang}`)
				const statusText =
					lang === "zh"
						? `最后修改时间：${lastModified} | 创建时间：${created}`
						: `Last Modified: ${lastModified} | Created: ${created}`;

				statusBarItemEl.setText(statusText);
			}
		}
	} else {
		statusBarItemEl.setText("");
	}
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	onOpen() {
// 		const {contentEl} = this;
// 		contentEl.setText('Woah!');
// 	}

// 	onClose() {
// 		const {contentEl} = this;
// 		contentEl.empty();
// 	}
// }

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Show Notes Created/Modified Time")
			.setDesc("Show notes created/last modified time in status bar")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showNoteTime === true)
					.onChange(async (value) => {
						this.plugin.settings.showNoteTime = value;
						// this.plugin.showPopupMessage(`the flag is ${this.plugin.settings.showNoteTime}`)
						await this.plugin.saveSettings();
					})
					.setTooltip(
						"Toggle to show/hide notes created/modified time in status bar",
					),
			);

		new Setting(containerEl)
			.setName("Set Translucent Folder")
			.setDesc(
				"Make folder with specific name translucent(useful for attachment folders)",
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter the folder name")
					.setValue(this.plugin.settings.translucentFolderName)
					.onChange(async (value) => {
						this.plugin.settings.translucentFolderName = value;
						await this.plugin.saveSettings();
					}),
			);
		// new Setting(containerEl)
		// 	.setName("Activate Macro")
		// 	.setDesc("activate some hot key in notes")
		// 	.addToggle((toggle) =>
		// 		toggle
		// 			.setValue(this.plugin.settings.activateMacro === "on")
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.activateMacro = value
		// 					? "on"
		// 					: "off";
		// 				await this.plugin.saveSettings();
		// 			})
		// 			.setTooltip("Toggle to activate/deactivate macro"),
		// 	);
	}
}
