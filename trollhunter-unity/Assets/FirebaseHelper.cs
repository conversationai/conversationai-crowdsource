using System.Collections;
using System.Collections.Generic;

// Helper class to handle Firebase-related functionalities.
public class FirebaseHelper {

	private UserAccount userAccount;
	private List<string> textSnapshot;

	// This should initialize the connection to Firebase.
	public void Init(UserAccount userAccount, Callback callback) {
		this.userAccount = userAccount;
		callback.OnSuccess();
	}

	public interface Callback {
		void OnSuccess();
		void OnFailure();
	}

	public void SubmitText(string text, Callback callback) {
		textSnapshot.Add(text);
		callback.OnSuccess();
	}

	public List<string> GetTextSnapshot() {
		return textSnapshot;
	}
}
