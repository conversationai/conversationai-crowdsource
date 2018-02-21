# CrowdFlower Integration

Steps to run a [CrowdFlower](http://www.crowdflower.com/) job using this interface.

1. **Deploy the Crowd 9 app.** Follow [these steps](api-service#pre-requisits) to run a hosted instance of the Crowd 9 app.

2. **Create a new Crowd 9 job.** Add a new entry to the `client_jobs` table corresponding to the job you want to run. You can either use the admin [API](api-service/api-server#api) or add the data directly to the database. You can then use the API to add questions for the job.

3. **Create a new CrowdFlower job.** In the Design tab, choose to use custom CSS/JS and paste in the code in the `crowdflower.js` file in this directory.

4. **Add data.** Create a CSV with fields `question_id` and `client_job_key`. The `question_id` should correspond to the unique ID for each qustion in your job that you want to annotate. The `client_job_key` should correspond to the job in the `client_jobs` table.

Your data should look something like this:

```
question_id,client_job_key
004ba3a74c7c5a1147aab625f0f705d4955df2d229d39c123332fe4893c44072,1k-demo-ptoxic
0076d1e1b9815a53ade444d4a69f72de72fca05cb356305ab32841cc4c88e61e,1k-demo-ptoxic
0089f96a9762963cba9e00dffecfd1ccd8a97749b1d9df286ecf7e1de0366102,1k-demo-ptoxic
0094596235a5f9288d388f1a649db5190a1212a16a759d04db5c84fea239bf59,1k-demo-ptoxic
...
```

Now you're ready to launch the job! You can check that it's working by looking at the CrowdFlower preview and checking that the annotation you add are showing up in the `answers` table in Spanner. You can also launch the job without openning it up for external users. You will get a sharable link to test the job and can validate the full data flow. To do this, go to the Launch tab, and in Settings, uncheck the External checkbox under the Contributors section.

### Potential Issues
* There is a unique constraint in the `answers` table that doesn't allow the same user to annotate the same question more than once. As a result, you may get 500 errors from `/api/answer/1k-demo-ptoxic` while testing.