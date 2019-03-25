using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Bootstrap_FileUpload.Models
{
    public class ApkInfo
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Size { get; set; }
        public string UploadDate { get; set; }
        public string Uri { get; set; }
        public string EncryptUrl  { get; set; }
    }
}