const licenseKey = 'NLuO9FkUw7jptj5MOOHMjI3qRx2Hlvwdp3tapLGEb7xiR8UstPPB/YVN';
const channelId = 'channel-id';

const appData = {
	// Users data.
	users: [
		{
			id: 'user-1',
			name: 'Joe Doe',
			// Note that the avatar is optional.
			avatar: 'https://randomuser.me/api/portraits/thumb/men/26.jpg'
		},
		{
			id: 'user-2',
			name: 'Ella Harper',
			avatar: 'https://randomuser.me/api/portraits/thumb/women/65.jpg'
		}
	],

	// The ID of the current user.
	userId: 'user-1',

	// Suggestions data.
	suggestions: [
		{
			id: 'suggestion-1',
			type: 'insertion',
			authorId: 'user-2',
			createdAt: new Date( 2019, 1, 13, 11, 20, 48 )
		},
		{
			id: 'suggestion-2',
			type: 'deletion',
			authorId: 'user-1',
			createdAt: new Date( 2019, 1, 14, 12, 7, 20 )
		},
		{
			id: 'suggestion-3',
			type: 'formatInline:886cqig6g8rf',
			authorId: 'user-1',
			createdAt: new Date( 2019, 2, 8, 10, 2, 7 ),
			data: {
				commandName: 'bold',
				commandParams: [ { forceValue: true } ]
			}
		}
	],

	// Editor initial data.
	initialData:
      `<h2>
          Bilingual Personality Disorder
      </h2>
      <p>
          This may be the first time you hear about this
          <suggestion id="suggestion-1:user-2" suggestion-type="insertion" type="start"></suggestion>
          made-up<suggestion id="suggestion-1:user-2" suggestion-type="insertion" type="end"></suggestion>
          disorder but it actually isn’t so far from the truth.
          As recent studies show, the language you speak has more effects on you than you realise.
          According to the studies, the language a person speaks affects their cognition,
          <suggestion id="suggestion-2:user-1" suggestion-type="deletion" type="start"></suggestion>
          feelings, <suggestion id="suggestion-2:user-1" suggestion-type="deletion" type="end"></suggestion>
          behaviour, emotions and hence <strong>their personality</strong>.
      </p>
      <p>
          This shouldn’t come as a surprise
          <a href="https://en.wikipedia.org/wiki/Lateralization_of_brain_function">since we already know</a>
          that different regions of the brain becomes more active depending on the activity.
          Since structure, information and especially
          <suggestion id="suggestion-3:user-1" suggestion-type="formatInline:886cqig6g8rf" type="start"></suggestion>
          the culture of languages<suggestion id="suggestion-3:user-1" suggestion-type="formatInline:886cqig6g8rf" type="end"></suggestion>
          varies substantially
          and the language a person speaks is a essential element of daily life.
      </p>`
};

class TrackChangesIntegration {
	constructor( editor ) {
		this.editor = editor;
	}

	init() {
		const usersPlugin = this.editor.plugins.get( 'Users' );
		const trackChangesPlugin = this.editor.plugins.get( 'TrackChanges' );

		// Load the users data.
		for ( const user of appData.users ) {
			usersPlugin.addUser( user );
		}

		// Set the current user.
		usersPlugin.defineMe( appData.userId );

		// Load the suggestions data.
		for ( const suggestion of appData.suggestions ) {
			trackChangesPlugin.addSuggestion( suggestion );
		}

		// In order to load comments added to suggestions, you
		// should also configure the comments integration.
	}
}

export default async function main() {
	const { InlineEditor: Editor, Context } = InlineEditor;

	// Don't truncate stack traces
	Error.stackTraceLimit = Infinity;

	const context = await Context.create( {
		sidebar: {
			container: document.querySelector( '#sidebar' )
		},
		collaboration: {
			channelId
		},
		licenseKey
	} );

	// Set up two editors using the same context, adding some suggestions to
	// editor1
	const editor1 = await Editor.create( document.querySelector( '#editor1' ), {
		context,
		extraPlugins: [ TrackChangesIntegration ]
	} );
	editor1.setData( appData.initialData );

	const editor2 = await Editor.create( document.querySelector( '#editor2' ), {
		context
	} );

	// Let suggestions load
	await new Promise( resolve => setTimeout( resolve, 10 ) );

	// Make sure editor2 isn't focused (so when we focus it we know the focus
	// state actually changes)
	editor2.sourceElement.blur();

	// Destroy editor1 (without await'ing it)
	editor1.destroy();

	// Simulate blocking operation that takes 500ms, so the annotations plugin's
	// debounced method will be called synchronously when we focus editor2
	const time = new Date();
	while ( new Date() - time < 500 ) {
		// ...
	}

	// Blur editor2
	editor2.sourceElement.focus();
}
