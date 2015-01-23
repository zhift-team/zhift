ZHIFT
=====
####Fast and easy shift-scheduling for small organizations.

**6.170 Final Team Project - Fall 2014**  
Anji Ren | Dylan Joss | Lily Seropian | Victoria Gong

####LINKS

[LIVE DEPLOYED APPLICATION](http://zhift-seropian.rhcloud.com/)  

####TESTING
The tests must be run locally and are located as a QUnit page at <code>/tests.html</code>. Tests can be run from the root directory with <code>npm test</code>.

####INSTRUCTIONS
#####*Pre-populated accounts:*  
Existing user accounts for an example organization 'ZhiftOrg' with pre-populated shifts. The associated Gmail accounts can be logged into to see how our email notifications work.

#####Manager

Name: *ZhiftManager*   
Email: *zhiftmanager@gmail.com*  
Organization: *ZhiftOrg*  
Password: *manager*

On Gmail: zhiftmanager@gmail.com; PW: managermanager  

#####Employees

Name: *ZhiftJohn*   
Email: *zhiftjohn@gmail.com*  
Organization: *ZhiftOrg*  
Password: *employee*

On Gmail: zhiftjohn@gmail.com; PW: employeeemployee  

Name: *ZhiftEmily*   
Email: *zhiftemily@gmail.com*  
Organization: *ZhiftOrg*  
Password: *employee*

On Gmail: zhiftemily@gmail.com; PW: employeeemployee

To create an new organization (auto-creates a new manager user account):
- Navigate to /.
- Click 'Create an organization'.
- Fill out the form.

To create an employee schedule for a new position (Cook, for example):
- After creating the manager account, you should be already logged in.
- Click the plus button at the top of the schedule shown on your landing page.
- Fill out the form with your desired position name ('Cook').

To create an account for a new manager or employee of your organization and invite them via email:
- Click the edit icon (pencil and paper) on your navigation bar.
- Click on the edit symbol besides 'Managers' or 'Employees'.
- Fill out the form.

To create a new permanent shift, as a manager, for an employee in your organization:
- Navigate to '/'.
- Click on the orange plus button in the timeslot of your choice in the displayed calendar.
- Fill out the form with the employee you wish to assign the new permanent shift to.
. This will autogenerate shifts to be displayed to the employees.

To reassign a permanent shift:
- Navigate to '/'.
- Click on an existing shift on the calendar, which will bring up a modal.
- Fill out the form with the employee you wish to reassign the permanent shift to.
- This will autoupdate the existing shifts displayed to the employees.

*EMPLOYEE ONLY*  
To put a temporal shift up for grabs:
- Log in to an employee account.
- Scroll to a shift on the calendar that you are currently resopnsible for and click 'GIVE UP'.
- Choose to place the shift up for grabs (other employees can claim automatically) or for swap (other employees must offer a shift back in return before you can finalize and approve a swap).
- You can check your current offer for a swap by clicking on the 'VIEW OFFERS' button that appears on the shift you put up for swap.

To claim a shift or make a swap offer for a shift:
- Scroll to a shift on the calendar that is up for grabs or up for swap and click on the button (either 'CLAIM' or 'MAKE OFFER').
- Fill out the form.

