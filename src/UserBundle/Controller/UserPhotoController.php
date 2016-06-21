<?php

namespace UserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use UserBundle\Entity\UserPhoto;

class UserPhotoController extends Controller
{
    /**
     * @param Request $request
     *
     * @Route("/ajax/user/photo/upload", name="user_ajax_photo_upload")
     *
     * @return JsonResponse
     *
     * @throws NotFoundHttpException
     */
    public function uploadPhoto(Request $request)
    {
        $userPhoto = new UserPhoto();
        $form      = $this->createForm('user_photo_form', $userPhoto);

        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($userPhoto);
            $em->flush();
            $helper = $this->container->get('vich_uploader.templating.helper.uploader_helper');
            $path   = $helper->asset($userPhoto, 'file');

            return new JsonResponse([
                'id'   => $userPhoto->getId(),
                'path' => $path,
            ], 200);
        }

        return new JsonResponse([
            'error' => (string) $form->getErrors(true),
        ], 400);
    }
}