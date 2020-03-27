import React, {useState, useRef, useEffect} from 'react'
import styled from 'styled-components'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const MainCanvas = styled.div`
    .hidden {
        display: none;
    }
`

const Main = () => {
    const storage = window.firebase.storage();
    const allInputs = {imgUrl: ''}
    const [imageAsFile, setImageAsFile] = useState('')
    const [imageAsUrl, setImageAsUrl] = useState(allInputs)
    const [load, setLoad] = useState(false)
    const canvas = useRef()
    const image = useRef()
    let ctx

    useEffect(() => {
        console.log(canvas.current)
        ctx = canvas.current.getContext("2d")
        
    }, [canvas])

    const [file, setFile] = useState('')
    async function fileHandler(e) {
        setImageAsFile(e.target.files[0])
        const reader = new FileReader();
        reader.onloadend = function(event) {
            setCropInfo({...cropInfo, src: reader.result})
            setFile(reader.result)
        }
        await reader.readAsDataURL(e.target.files[0])
        // setFile(reader.result)
        setLoad(true)
        await canvasHandler()
    }

    function canvasHandler() {
        image.current.onload = () => {
            ctx.drawImage(image.current, 0, 0)
            ctx.front = "40px Courier"
            // ctx.fillText(text, 210, 75)
        }
    }

    const firebaseHandler = e => {
        e.preventDefault();
        const uploadTask = storage.ref(`/images/${imageAsFile.name}`).put(imageAsFile);
        uploadTask.on('state_changed', 
        (snapShot) => {
          //takes a snap shot of the process as it is happening
          console.log(snapShot)
        }, (err) => {
          //catches the errors
          console.log(err)
        }, () => {
          // gets the functions from storage refences the image storage in firebase by the children
          // gets the download url then sets the image from firebase as the value for the imgUrl key:
          storage.ref('images').child(imageAsFile.name).getDownloadURL()
           .then(fireBaseUrl => {
             setImageAsUrl(prevObject => ({...prevObject, imgUrl: fireBaseUrl}))
           })
        })
    }

    const [cropInfo, setCropInfo] = useState({
        scr: null,
        crop: {
            unit: '%',
            width: 50,
            height: 100,
            // aspect: 16/9
        },
        croppedImgUrl: null
    })
    const onImageLoaded = image => {
        this.imageRef = image
    }
    
    const onCropChange = (crop) => {
        setCropInfo({...cropInfo, crop });
    }
    
    const onCropComplete = crop => {
        if (image && crop.width && crop.height) {
            const croppedImageUrl = getCroppedImg(image.current, crop)
            setCropInfo({...cropInfo, croppedImgUrl: croppedImageUrl })
        }
    }

    const getCroppedImg = (image, crop) => {
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
         )
    
        const reader = new FileReader()
        canvas.toBlob(blob => {
            reader.readAsDataURL(blob)
            reader.onloadend = () => {
                this.dataURLtoFile(reader.result, 'cropped.jpg')
            }
        })
    }
    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
            
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        let croppedImage = new File([u8arr], filename, {type:mime});
        setCropInfo({...cropInfo, croppedImage: croppedImage }) 
    }
    return (
        <MainCanvas>
            <form onSubmit={firebaseHandler}>
                <label>
                    <input type='file' onChange={fileHandler}/>
                </label>
                <input type='submit' value='submit' />
            </form>
            <div>
                <canvas ref={canvas} width={600} height={400} />
                {load ? <img ref={image} src={file} alt="uploadedImg" className="hidden"/>:null}
                {cropInfo.src && (
                <ReactCrop
                  src={cropInfo.src}
                  crop={cropInfo.crop}
                  onChange={onCropChange}
                 /> 
                )}
            </div>
        </MainCanvas>
    )
}

export default Main

