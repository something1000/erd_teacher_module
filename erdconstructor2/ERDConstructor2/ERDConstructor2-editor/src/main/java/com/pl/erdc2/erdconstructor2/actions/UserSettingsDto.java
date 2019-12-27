package com.pl.erdc2.erdconstructor2.actions;

public class UserSettingsDto{
        private String firstName;
        private String lastName;
        private String indexNo;
        private String groupID;
        private String termCode;
        private String email;

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getIndexNo() {
            return indexNo;
        }

        public void setIndexNo(String indexNo) {
            this.indexNo = indexNo;
        }
        
        public String getGroupID() {
            return groupID;
        }
        
        public void setGroupID(String groupID) {
            this.groupID = groupID;
        }

        public String getTermCode() {
            return termCode;
        }

        public void setTermCode(String termCode) {
            this.termCode = termCode;
        }
        
        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

    }
