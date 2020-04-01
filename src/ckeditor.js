/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ContextBase from '@ckeditor/ckeditor5-core/src/context';
import InlineEditorBase from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import TrackChanges from '@ckeditor/ckeditor5-track-changes/src/trackchanges';

// Context plugins:
import CommentsRepository from '@ckeditor/ckeditor5-comments/src/comments/commentsrepository';
import NarrowSidebar from '@ckeditor/ckeditor5-comments/src/annotations/narrowsidebar';
import WideSidebar from '@ckeditor/ckeditor5-comments/src/annotations/widesidebar';

class Context extends ContextBase {}

// Plugins to include in the context.
Context.builtinPlugins = [
	CommentsRepository, NarrowSidebar, WideSidebar
];

class InlineEditor extends InlineEditorBase {}

// Plugins to include in the build.
InlineEditor.builtinPlugins = [ Essentials, Paragraph, TrackChanges ];

// The editor configuration.
InlineEditor.defaultConfig = {
	language: 'en'
};

import { default as main } from './main';

export default { Context, InlineEditor, main };
